import os
import requests
from dotenv import load_dotenv

load_dotenv()

ALPACA_API_KEY = os.getenv("ALPACA_API_KEY")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")
ALPACA_BASE_URL = os.getenv("ALPACA_BASE_URL", "https://paper-api.alpaca.markets")

def is_configured() -> bool:
    """Check if Alpaca API keys are available in .env"""
    return bool(ALPACA_API_KEY and ALPACA_SECRET_KEY)

def _get_headers() -> dict:
    return {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
        "accept": "application/json"
    }

def get_account() -> dict:
    """Fetch Alpaca paper account info (equity, buying power, etc.)"""
    if not is_configured():
        return {
            "equity": "250000.00",
            "buying_power": "100000.00",
            "cash": "50000.00",
            "currency": "USD",
            "status": "MOCKED_NO_KEYS"
        }
    
    url = f"{ALPACA_BASE_URL}/v2/account"
    try:
        response = requests.get(url, headers=_get_headers())
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"[alpaca] get_account error: {e}")
        return {"error": str(e), "status": "FAILED"}

def get_positions() -> list:
    """Fetch open positions in the Alpaca account"""
    if not is_configured():
        return []
        
    url = f"{ALPACA_BASE_URL}/v2/positions"
    try:
        response = requests.get(url, headers=_get_headers())
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"[alpaca] get_positions error: {e}")
        return []

def submit_order(symbol: str, qty: float, side: str, type: str = "market", time_in_force: str = "gtc") -> dict:
    """Execute a market order via Alpaca API"""
    if not is_configured():
        return {
            "id": f"mock-{int(qty)}-{symbol}",
            "symbol": symbol.upper(),
            "qty": str(qty),
            "side": side.lower(),
            "type": type,
            "status": "accepted", 
            "filled_avg_price": None,
            "warning": "Mocked response, .env keys missing."
        }
        
    url = f"{ALPACA_BASE_URL}/v2/orders"
    payload = {
        "symbol": symbol.upper(),
        "qty": str(qty),
        "side": side.lower(),
        "type": type,
        "time_in_force": time_in_force
    }
    
    try:
        # Check if the symbol is a crypto (e.g. BTC) and map to Alpaca syntax
        if symbol.upper() in ["BTC", "ETH", "SOL"]:
            payload["symbol"] = f"{symbol.upper()}/USD"
            
        print(f"[alpaca] Submitting order: {payload}")
        response = requests.post(url, json=payload, headers=_get_headers())
        response.raise_for_status()
        return response.json()
    except Exception as e:
        err_msg = str(e)
        if hasattr(e, 'response') and e.response is not None:
            err_msg = e.response.text
        print(f"[alpaca] Order error: {err_msg}")
        return {"error": err_msg, "status": "failed"}
