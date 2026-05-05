from fastapi import APIRouter, HTTPException
import qrcode
import io
import base64
from typing import Dict, Any
from db.supabase import supabase_client

router = APIRouter()

@router.get("/{user_id}")
def generate_passport(user_id: str) -> Dict[str, Any]:
    """Génère un QR code encodant les infos du profil étudiant en Base64."""
    profile_resp = (
        supabase_client.table("profiles")
        .select("name,level,interests")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    p = (profile_resp.data or [None])[0]
    if not p:
        profile_data = "Nom: Hackathon ORI; Niveau: Bac+3; Intérêts: IA, Dev"
    else:
        profile_data = f"Nom: {p.get('name')}; Niveau: {p.get('level')}; Intérêts: {','.join(p.get('interests', []))}"

    tickets_resp = (
        supabase_client.table("fair_tickets")
        .select("ticket_id,fair_name,quantity")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    tickets = tickets_resp.data or []

    ticket_blob = "Aucun ticket"
    if tickets:
        ticket_blob = " | ".join([f"{t.get('fair_name')} ({t.get('ticket_id')}) x{t.get('quantity')}" for t in tickets])
    payload = f"{profile_data}; Tickets: {ticket_blob}"

    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(payload)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    
    # Render to bytes
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    return {
        "status": "success",
        "qr_base64": f"data:image/png;base64,{img_str}",
        "tickets": tickets
    }
