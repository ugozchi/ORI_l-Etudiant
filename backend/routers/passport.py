from fastapi import APIRouter, HTTPException
import qrcode
import io
import base64
from typing import Dict, Any
from routers.profile import PROFILES_DB

router = APIRouter()

@router.get("/{user_id}")
def generate_passport(user_id: str) -> Dict[str, Any]:
    """Génère un QR code encodant les infos du profil étudiant en Base64."""
    if user_id not in PROFILES_DB:
        # Mocking data for demo purposes if no profile exists
        profile_data = "Nom: Hackathon ORI; Niveau: Bac+3; Intérêts: IA, Dev"
    else:
        p = PROFILES_DB[user_id]
        profile_data = f"Nom: {p.get('name')}; Niveau: {p.get('level')}; Intérêts: {','.join(p.get('interests', []))}"

    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(profile_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    
    # Render to bytes
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    return {
        "status": "success",
        "qr_base64": f"data:image/png;base64,{img_str}"
    }
