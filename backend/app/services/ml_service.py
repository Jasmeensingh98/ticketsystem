import os
from app.ml.preprocessing import extract_urgency_features, normalize_text, extract_salient_keywords
from app.ml.category_model import CategoryModel
from app.ml.priority_model import PriorityModel


class MLService:
    def __init__(self):
        self.category_model = CategoryModel(demo_mode=os.getenv('DEMO_MODE', 'true').lower() == 'true')
        self.priority_model = PriorityModel(demo_mode=os.getenv('DEMO_MODE', 'true').lower() == 'true')

    def analyze_ticket(self, ticket_data):
        title = ticket_data.get('title', '')
        description = ticket_data.get('description', '')
        category_result = self.category_model.predict(description, title)

        urgency_features = extract_urgency_features({
            'title': title,
            'description': description,
            'category': category_result.get('category', 'Other'),
            'affected_users': ticket_data.get('affected_users', 1),
            'business_impact': ticket_data.get('business_impact', 'Low'),
            'downtime': ticket_data.get('downtime', 'None'),
        })

        priority_result = self.priority_model.predict(urgency_features)
        keywords = extract_salient_keywords(f"{title} {description}", top_n=8)

        routing_reason = (
            f"Category={category_result.get('category')}, Priority={priority_result.get('priority')}"
        )

        return {
            'category': category_result.get('category'),
            'category_confidence': category_result.get('confidence', 0.0),
            'priority': priority_result.get('priority'),
            'priority_confidence': priority_result.get('confidence', 0.0),
            'important_keywords': keywords,
            'urgency_indicators': urgency_features,
            'routing_reason': routing_reason,
            'model_name': category_result.get('model_name', 'Demo DistilBERT') + ' / ' + priority_result.get('model_name', 'Demo XGBoost'),
            'model_version': category_result.get('model_version', 'demo-v1.0'),
            'ai_message': 'Demo AI Model' if os.getenv('DEMO_MODE', 'true').lower() == 'true' else 'Production Fine-Tuned Model',
            'is_demo': os.getenv('DEMO_MODE', 'true').lower() == 'true',
            'confidence': round((category_result.get('confidence', 0.0) + priority_result.get('confidence', 0.0)) / 2, 4),
        }
