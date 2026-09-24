from typing import List, Dict, Any
from app.models import KnowledgeArticle
import re


class KnowledgeService:
    def search(self, title: str = '', description: str = '', category: str = '') -> List[Dict[str, Any]]:
        query_text = f"{title} {description}".lower()
        query_tokens = set(re.findall(r'\b[a-z0-9\-]{3,}\b', query_text))

        articles = KnowledgeArticle.query.all()
        scored_articles = []

        for article in articles:
            article_text = f"{article.title} {article.keywords or ''} {article.problem or ''}".lower()
            article_tokens = set(re.findall(r'\b[a-z0-9\-]{3,}\b', article_text))

            # Jaccard / Overlap token matching
            overlap = query_tokens.intersection(article_tokens)
            base_score = len(overlap) * 12

            # Category boost
            if category and (article.category or '').lower() == category.lower():
                base_score += 35

            # Direct keyword search match
            if article.keywords:
                for kw in [k.strip().lower() for k in article.keywords.split(',')]:
                    if kw and kw in query_text:
                        base_score += 25

            # Compute match percentage between 60% and 96%
            if base_score > 0:
                match_percentage = min(96, 62 + base_score)
            else:
                match_percentage = 45

            scored_articles.append({
                'id': article.id,
                'title': article.title,
                'category': article.category,
                'keywords': article.keywords,
                'problem': article.problem,
                'solution': article.solution,
                'related_tickets': article.related_tickets,
                'match_score': match_percentage,
                'created_at': article.created_at.isoformat() if article.created_at else None,
            })

        # Sort descending by match score and return top 3
        scored_articles.sort(key=lambda x: x['match_score'], reverse=True)
        return scored_articles[:3]
