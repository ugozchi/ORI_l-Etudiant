def score_fair(profile: dict, fair: dict) -> float:
    """Score 0-100 de pertinence salon pour un profil."""
    score = 0

    # Si pas de profil, on donne un score moyen par défaut
    if not profile:
        return 50.0

    # Correspondance ville (40 points)
    profile_city = profile.get("city", "").lower()
    fair_city = fair.get("city", "").lower()
    fair_region = fair.get("region", "").lower()
    
    if profile_city and profile_city == fair_city:
        score += 40
    elif profile.get("region", "").lower() == fair_region and fair_region:
        score += 20

    # Correspondance thématique (40 points)
    profile_interests = set(profile.get("interests", []))
    fair_topics = set(fair.get("topics", []))
    
    if profile_interests and fair_topics:
        overlap = profile_interests & fair_topics
        if fair_topics:
            score += int(40 * len(overlap) / len(fair_topics))

    # Correspondance niveau (20 points)
    profile_level = profile.get("level")
    target_levels = fair.get("target_levels", [])
    if profile_level and profile_level in target_levels:
        score += 20

    return min(score, 100)
