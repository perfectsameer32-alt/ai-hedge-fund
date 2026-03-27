"""
Portfolio Routes
If Alpaca Paper Trading is configured, returns real live paper trades.
If missing, returns simulated portfolio data built from real market prices.
"""

from fastapi import APIRouter
from services import market, alpaca

router = APIRouter()

# Simulated fallback portfolio if .env keys are missing (quantities are fixed, prices are live)
HOLDINGS = {
    "AAPL": {"quantity": 150, "avg_cost": 170.00},
    "TSLA": {"quantity": 80, "avg_cost": 240.00},
    "NVDA": {"quantity": 60, "avg_cost": 780.00},
    "GOOGL": {"quantity": 100, "avg_cost": 150.00},
    "BTC": {"quantity": 1.5, "avg_cost": 58000.00},
    "ETH": {"quantity": 12.0, "avg_cost": 3100.00},
}


@router.get("/portfolio")
def get_portfolio():
    """
    Return a complete portfolio snapshot.
    Uses real Alpaca portfolio if configured, else falls back to mock live data.
    """
    if alpaca.is_configured():
        return _get_alpaca_portfolio()
    else:
        return _get_mock_portfolio()


def _get_alpaca_portfolio():
    """Fetch real data from Alpaca Paper Trading"""
    account = alpaca.get_account()
    raw_positions = alpaca.get_positions()
    
    positions = []
    total_cost = 0.0
    
    for pos in raw_positions:
        qty = float(pos["qty"])
        avg_cost = float(pos["avg_entry_price"])
        market_value = float(pos["market_value"])
        current_price = float(pos["current_price"])
        cost_basis = float(pos["cost_basis"])
        pnl = float(pos["unrealized_pl"])
        pnl_pct = float(pos["unrealized_plpc"]) * 100
        change_24h = float(pos["change_today"]) * 100
        
        total_cost += cost_basis
        
        positions.append({
            "symbol": pos["symbol"],
            "type": "crypto" if pos["asset_class"] == "crypto" else "stock",
            "quantity": qty,
            "avg_cost": round(avg_cost, 2),
            "current_price": round(current_price, 2),
            "market_value": round(market_value, 2),
            "pnl": round(pnl, 2),
            "pnl_pct": round(pnl_pct, 2),
            "change_24h": round(change_24h, 2),
        })

    equity = float(account.get("equity", 0))
    total_pnl = equity - total_cost
    total_pnl_pct = (total_pnl / total_cost * 100) if total_cost else 0
    sharpe = round(1.5 + (total_pnl_pct / 10) * 0.3, 2)  # Proxy logic

    return {
        "nav": round(equity, 2),
        "total_cost": round(total_cost, 2),
        "total_pnl": round(total_pnl, 2),
        "total_pnl_pct": round(total_pnl_pct, 2),
        "sharpe_ratio": sharpe,
        "active_positions": len(positions),
        "positions": positions,
        "mode": "alpaca",
        "buying_power": round(float(account.get("buying_power", 0)), 2)
    }

    
def _get_mock_portfolio():
    """Fetch mock data for development"""
    positions = []
    total_value = 0.0
    total_cost = 0.0

    for symbol, holding in HOLDINGS.items():
        price_data = market.get_price(symbol)
        current_price = price_data.get("price", 0)

        position_value = current_price * holding["quantity"]
        position_cost = holding["avg_cost"] * holding["quantity"]
        pnl = position_value - position_cost
        pnl_pct = (pnl / position_cost * 100) if position_cost else 0

        total_value += position_value
        total_cost += position_cost

        positions.append({
            "symbol": symbol,
            "type": price_data.get("type", "stock"),
            "quantity": holding["quantity"],
            "avg_cost": holding["avg_cost"],
            "current_price": current_price,
            "market_value": round(position_value, 2),
            "pnl": round(pnl, 2),
            "pnl_pct": round(pnl_pct, 2),
            "change_24h": price_data.get("change_24h", 0),
        })

    total_pnl = total_value - total_cost
    total_pnl_pct = (total_pnl / total_cost * 100) if total_cost else 0
    sharpe = round(1.5 + (total_pnl_pct / 10) * 0.3, 2)

    return {
        "nav": round(total_value, 2),
        "total_cost": round(total_cost, 2),
        "total_pnl": round(total_pnl, 2),
        "total_pnl_pct": round(total_pnl_pct, 2),
        "sharpe_ratio": sharpe,
        "active_positions": len(positions),
        "positions": positions,
        "mode": "mock",
        "buying_power": 100000.00
    }
