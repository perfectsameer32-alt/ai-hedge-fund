from fastapi import APIRouter, Depends
import models, auth

router = APIRouter()

@router.get("/dashboard")
# the current_user dependency ensures this is a protected route
def get_dashboard_data(current_user: models.User = Depends(auth.get_current_user)):
    # Mock data to simulate an AI hedge fund dashboard
    return {
        "portfolio_value": 124500.75,
        "profit_loss": 12500.25,
        "profit_loss_percentage": 11.16,
        "active_trades": 14,
        "recent_trades": [
            {"id": "t_001", "asset": "AAPL", "type": "BUY", "amount": 50, "price": 172.50, "status": "COMPLETED"},
            {"id": "t_002", "asset": "TSLA", "type": "SELL", "amount": 20, "price": 175.20, "status": "COMPLETED"},
            {"id": "t_003", "asset": "BTC", "type": "BUY", "amount": 0.5, "price": 64200.00, "status": "PENDING"}
        ],
        "message": f"Welcome back, {current_user.email}!"
    }
