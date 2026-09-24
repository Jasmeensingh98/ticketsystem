import os
from typing import Dict, Any


class PriorityModel:
    PRIORITIES = ['Critical', 'High', 'Medium', 'Low']

    def __init__(self, demo_mode: bool = None, model_path: str = None):
        if demo_mode is not None:
            self.demo_mode = demo_mode
        else:
            self.demo_mode = os.getenv('DEMO_MODE', 'true').lower() == 'true'

        self.model_path = model_path or os.getenv('PRIORITY_MODEL_PATH')
        self.booster = None

        if not self.demo_mode and self.model_path and os.path.exists(self.model_path):
            try:
                import xgboost as xgb
                self.booster = xgb.Booster()
                self.booster.load_model(self.model_path)
            except Exception as e:
                print(f"[PriorityModel] Failed to load XGBoost model: {e}")
                self.demo_mode = True

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        if not self.demo_mode and self.booster:
            return self._xgboost_predict(features)
        return self._demo_predict(features)

    def _xgboost_predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        try:
            import xgboost as xgb
            import numpy as np

            feature_vector = [
                float(features.get('affected_users', 1) or 1),
                float(features.get('business_impact_score', 0) or 0),
                float(features.get('downtime_score', 0) or 0),
                float(features.get('security_impact', 0) or 0),
                float(features.get('system_criticality', 0) or 0),
                float(features.get('deadline_sensitive', 0) or 0),
                float(features.get('user_reported_urgency', 0) or 0),
                float(features.get('text_length', 50) or 50),
            ]
            dmatrix = xgb.DMatrix([feature_vector])
            probabilities = self.booster.predict(dmatrix)[0]
            pred_idx = int(np.argmax(probabilities))
            priority = self.PRIORITIES[pred_idx]
            confidence = float(probabilities[pred_idx])

            return {
                'priority': priority,
                'confidence': round(confidence, 4),
                'model_name': 'XGBoost Classifier',
                'model_version': 'production-v1.0',
                'is_demo': False,
            }
        except Exception as e:
            print(f"[PriorityModel] XGBoost inference error: {e}. Falling back to demo.")
            return self._demo_predict(features)

    def _demo_predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        affected_users = int(features.get('affected_users', 1) or 1)
        business_impact = int(features.get('business_impact_score', 0) or 0)
        downtime = int(features.get('downtime_score', 0) or 0)
        security_impact = int(features.get('security_impact', 0) or 0)
        system_criticality = int(features.get('system_criticality', 0) or 0)
        deadline_sensitive = int(features.get('deadline_sensitive', 0) or 0)
        user_urgency = int(features.get('user_reported_urgency', 0) or 0)

        score = 0.0

        if affected_users >= 100:
            score += 0.45
        elif affected_users >= 20:
            score += 0.30
        elif affected_users >= 5:
            score += 0.15
        else:
            score += 0.05

        score += business_impact * 0.25
        score += downtime * 0.20
        score += security_impact * 0.25
        score += system_criticality * 0.20
        score += deadline_sensitive * 0.15
        score += user_urgency * 0.10

        if score >= 0.95 or (security_impact == 1 and business_impact >= 2) or (affected_users >= 50 and downtime >= 1):
            priority = 'Critical'
            confidence = min(0.95, 0.86 + (score * 0.03))
        elif score >= 0.55:
            priority = 'High'
            confidence = min(0.92, 0.81 + (score * 0.04))
        elif score >= 0.30:
            priority = 'Medium'
            confidence = min(0.88, 0.76 + (score * 0.05))
        else:
            priority = 'Low'
            confidence = 0.78

        return {
            'priority': priority,
            'confidence': round(confidence, 4),
            'model_name': 'Demo XGBoost',
            'model_version': 'demo-v1.0',
            'is_demo': True,
            'calculated_score': round(score, 3)
        }
