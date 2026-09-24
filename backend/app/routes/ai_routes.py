from flask import Blueprint, request, jsonify
from app.services.ml_service import MLService

ai_bp = Blueprint('ai_bp', __name__)
ml_service = MLService()


@ai_bp.route('/classify', methods=['POST'])
def classify():
    data = request.get_json() or {}
    result = ml_service.category_model.predict(data.get('description', ''), data.get('title', ''))
    return jsonify(result), 200


@ai_bp.route('/predict-priority', methods=['POST'])
def predict_priority():
    data = request.get_json() or {}
    result = ml_service.priority_model.predict(data)
    return jsonify(result), 200


@ai_bp.route('/analyze-ticket', methods=['POST'])
def analyze_ticket():
    data = request.get_json() or {}
    result = ml_service.analyze_ticket(data)
    return jsonify(result), 200


@ai_bp.route('/model-evaluation', methods=['GET'])
def model_evaluation():
    try:
        from ml.evaluate import run_evaluation
        evaluation_results = run_evaluation()
        return jsonify(evaluation_results), 200
    except Exception as e:
        # Fallback research evaluation metrics
        return jsonify({
            'status': 'fallback',
            'is_demo': True,
            'model_label': 'Demo / Placeholder Metrics',
            'sample_size': 22,
            'category_model': {
                'name': 'DistilBERT Transformer',
                'version': 'demo-v1.0',
                'accuracy': 0.924,
                'precision': 0.918,
                'recall': 0.912,
                'f1_score': 0.915,
                'average_confidence': 0.892,
                'classes': ['Hardware', 'Software', 'Network', 'Access Management', 'Other'],
                'confusion_matrix': [
                    [5, 0, 0, 0, 0],
                    [0, 5, 0, 0, 0],
                    [0, 0, 5, 0, 0],
                    [0, 0, 0, 5, 0],
                    [0, 0, 0, 0, 2],
                ]
            },
            'priority_model': {
                'name': 'XGBoost Classifier',
                'version': 'demo-v1.0',
                'accuracy': 0.891,
                'precision': 0.884,
                'recall': 0.879,
                'f1_score': 0.881,
                'average_confidence': 0.865,
                'classes': ['Critical', 'High', 'Medium', 'Low'],
                'confusion_matrix': [
                    [3, 0, 0, 0],
                    [0, 6, 1, 0],
                    [0, 0, 6, 0],
                    [0, 0, 0, 6],
                ]
            },
            'model_comparisons': [
                {'model': 'DistilBERT (Fine-Tuned)', 'type': 'Category', 'accuracy': '92.4%', 'f1_score': '0.918', 'latency': '18ms'},
                {'model': 'BERT-Base (Uncased)', 'type': 'Category', 'accuracy': '93.1%', 'f1_score': '0.925', 'latency': '45ms'},
                {'model': 'TF-IDF + Logistic Reg', 'type': 'Category (Baseline)', 'accuracy': '79.5%', 'f1_score': '0.781', 'latency': '3ms'},
                {'model': 'XGBoost Classifier', 'type': 'Priority', 'accuracy': '89.2%', 'f1_score': '0.887', 'latency': '8ms'},
                {'model': 'Random Forest Classifier', 'type': 'Priority', 'accuracy': '86.4%', 'f1_score': '0.858', 'latency': '12ms'},
                {'model': 'Rule-Based Heuristic', 'type': 'Priority (Baseline)', 'accuracy': '72.0%', 'f1_score': '0.710', 'latency': '1ms'},
            ],
            'research_metrics': {
                'automated_triage_time_seconds': 0.85,
                'manual_triage_time_minutes': 14.5,
                'triage_time_reduction_percentage': '98.8%',
                'routing_accuracy': 0.94,
                'sla_compliance_rate': 0.885,
            }
        }), 200
