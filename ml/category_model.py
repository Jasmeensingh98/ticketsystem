import os
import re
from typing import Dict, Any


class CategoryModel:
    CATEGORIES = ['Hardware', 'Software', 'Network', 'Access Management', 'Other']

    def __init__(self, demo_mode: bool = None, model_path: str = None):
        if demo_mode is not None:
            self.demo_mode = demo_mode
        else:
            self.demo_mode = os.getenv('DEMO_MODE', 'true').lower() == 'true'

        self.model_path = model_path or os.getenv('CATEGORY_MODEL_PATH')
        self.classifier = None

        if not self.demo_mode and self.model_path and os.path.exists(self.model_path):
            try:
                from transformers import pipeline
                self.classifier = pipeline(
                    "text-classification",
                    model=self.model_path,
                    tokenizer=self.model_path,
                    return_all_scores=True
                )
            except Exception as e:
                print(f"[CategoryModel] Failed to load transformer model: {e}")
                self.demo_mode = True

    def predict(self, text: str, title: str = '') -> Dict[str, Any]:
        combined = f"{title} {text}".strip()
        if not self.demo_mode and self.classifier:
            return self._transformer_predict(combined)
        return self._demo_predict(combined)

    def _transformer_predict(self, text: str) -> Dict[str, Any]:
        try:
            scores = self.classifier(text[:512])[0]
            best = max(scores, key=lambda x: x['score'])
            return {
                'category': best['label'],
                'confidence': round(float(best['score']), 4),
                'model_name': 'DistilBERT Transformer',
                'model_version': 'production-v1.2',
                'is_demo': False,
            }
        except Exception as e:
            print(f"[CategoryModel] Transformer error: {e}. Falling back to demo.")
            return self._demo_predict(text)

    def _demo_predict(self, text: str) -> Dict[str, Any]:
        cleaned = text.lower()
        patterns = {
            'Network': [
                (r'\b(vpn|wi-fi|wifi|ethernet|dns|dhcp|lan|wan|router|switch|gateway|bandwidth|latency|packet loss|firewall|proxy|subnet|ip address|connectivity|network outage)\b', 3.0),
                (r'\b(connection|internet|offline|disconnect|timeout|ping)\b', 1.5),
            ],
            'Hardware': [
                (r'\b(laptop|desktop|monitor|screen|keyboard|mouse|docking station|printer|battery|charger|power cord|ram|hard drive|ssd|hdd|motherboard|cpu|overheating|gpu|fan)\b', 3.0),
                (r'\b(hardware|physical|broken|cracked|beeping|powering on|won\'t turn on|black screen)\b', 1.5),
            ],
            'Software': [
                (r'\b(excel|outlook|teams|zoom|word|office|photoshop|slack|browser|chrome|firefox|windows|macos|linux|installation|installer|update|patch|bug|crash|error code|freeze|glitch|license)\b', 2.5),
                (r'\b(software|application|app|program|crashing|installed|reinstall)\b', 1.5),
            ],
            'Access Management': [
                (r'\b(password|reset password|account locked|locked out|unlock|mfa|2fa|authenticator|sso|login|log in|permission|access denied|privilege|role|active directory|ldap|identity)\b', 3.0),
                (r'\b(access|credentials|sign in|auth|token|security key)\b', 1.5),
            ],
        }

        scores = {cat: 0.1 for cat in self.CATEGORIES}
        for cat, pat_list in patterns.items():
            for pat, weight in pat_list:
                matches = re.findall(pat, cleaned)
                scores[cat] += len(matches) * weight

        best_category = max(scores, key=scores.get)
        max_score = scores[best_category]

        if max_score > 3.0:
            confidence = min(0.96, 0.85 + (max_score * 0.02))
        elif max_score > 1.2:
            confidence = min(0.88, 0.72 + (max_score * 0.05))
        elif max_score > 0.5:
            confidence = 0.74
        else:
            best_category = 'Other'
            confidence = 0.65

        return {
            'category': best_category,
            'confidence': round(confidence, 4),
            'model_name': 'Demo DistilBERT',
            'model_version': 'demo-v1.0',
            'is_demo': True,
        }
