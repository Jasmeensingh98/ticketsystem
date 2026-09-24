import re
from typing import Dict, List, Any


STOPWORDS = {
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any',
    'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between',
    'both', 'but', 'by', 'could', 'did', 'do', 'does', 'doing', 'down', 'during',
    'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he',
    'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in',
    'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself',
    'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought',
    'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so',
    'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves',
    'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under',
    'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which',
    'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself',
    'yourselves'
}


def normalize_text(text: str) -> str:
    """Clean and preprocess ticket text."""
    if not text:
        return ''
    # Lowercase conversion
    text = text.lower()
    # Remove URL links
    text = re.sub(r'http\S+|www\.\S+', '', text)
    # Remove unnecessary special characters but preserve hyphens in tech words
    text = re.sub(r'[^a-z0-9\s\-]', ' ', text)
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def tokenize(text: str, remove_stopwords: bool = True) -> List[str]:
    """Tokenize normalized text and optionally remove common stopwords."""
    normalized = normalize_text(text)
    if not normalized:
        return []
    tokens = normalized.split()
    if remove_stopwords:
        tokens = [t for t in tokens if t not in STOPWORDS and len(t) > 1]
    return tokens


def extract_salient_keywords(text: str, top_n: int = 8) -> List[str]:
    """Extract top keywords from ticket text."""
    tokens = tokenize(text, remove_stopwords=True)
    seen = set()
    keywords = []
    for token in tokens:
        if token not in seen:
            seen.add(token)
            keywords.append(token)
        if len(keywords) >= top_n:
            break
    return keywords


def extract_urgency_features(ticket: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract engineered urgency and impact features for the XGBoost priority model.
    """
    title = str(ticket.get('title', '') or '')
    description = str(ticket.get('description', '') or '')
    combined = (title + ' ' + description).lower()

    # Affected users extraction / normalization
    raw_users = ticket.get('affected_users', 1)
    try:
        affected_users = int(raw_users) if raw_users is not None else 1
    except (ValueError, TypeError):
        affected_users = 1

    # Check for user magnitude indicators in text
    if any(k in combined for k in ['all users', 'entire company', 'all employees', 'organization-wide', 'department wide', 'everyone']):
        affected_users = max(affected_users, 150)
    elif any(k in combined for k in ['multiple users', 'entire team', 'several employees', 'whole team']):
        affected_users = max(affected_users, 25)

    # Business impact detection
    business_impact_str = str(ticket.get('business_impact', '')).lower()
    if business_impact_str in ['critical', 'high', 'outage', 'mission-critical']:
        business_impact_score = 3
    elif business_impact_str in ['medium', 'moderate']:
        business_impact_score = 2
    else:
        business_impact_score = 1 if any(k in combined for k in ['production', 'revenue', 'client facing', 'customer', 'payroll', 'erp']) else 0

    # Downtime indicator
    downtime_str = str(ticket.get('downtime', '')).lower()
    if downtime_str in ['total outage', 'total', 'offline', 'hours']:
        downtime_score = 2
    elif downtime_str in ['partial', 'degraded', 'intermittent']:
        downtime_score = 1
    else:
        downtime_score = 1 if any(k in combined for k in ['down', 'outage', 'not working', 'offline', 'crashed', 'dead', 'freeze']) else 0

    # Security impact
    security_impact = 1 if any(k in combined for k in [
        'security', 'breach', 'ransomware', 'virus', 'phishing', 'unauthorized',
        'compromised', 'hacked', 'credential', 'locked account', 'mfa failed'
    ]) else 0

    # System criticality
    system_criticality = 1 if any(k in combined for k in [
        'production', 'core server', 'database', 'vpn gateway', 'active directory',
        'firewall', 'primary switch', 'payment', 'erp', 'main cluster'
    ]) else 0

    # Deadline / SLA sensitivity
    deadline_sensitive = 1 if any(k in combined for k in [
        'urgent', 'asap', 'immediately', 'critical deadline', 'board meeting',
        'audit', 'today', 'emergency', 'sla breach'
    ]) else 0

    # User reported urgency
    user_reported_urgency = 1 if any(k in combined for k in [
        'urgent', 'emergency', 'blocking work', 'cannot proceed', 'halted', 'stopper'
    ]) else 0

    category = ticket.get('category', 'Other') or 'Other'

    return {
        'affected_users': affected_users,
        'business_impact_score': business_impact_score,
        'downtime_score': downtime_score,
        'security_impact': security_impact,
        'system_criticality': system_criticality,
        'deadline_sensitive': deadline_sensitive,
        'user_reported_urgency': user_reported_urgency,
        'category': category,
        'text_length': len(combined.strip()),
        'word_count': len(combined.split()),
    }
