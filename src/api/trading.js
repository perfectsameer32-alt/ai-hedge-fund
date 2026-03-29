import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, updateDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

// Initialize or get the user's portfolio
export async function getUserPortfolio() {
  const user = auth.currentUser;
  if (!user) return null;

  const portfolioRef = doc(db, "portfolios", user.uid);
  const snap = await getDoc(portfolioRef);

  if (!snap.exists()) {
    // Create new portfolio with $10,000 balance
    const newPortfolio = {
      userId: user.uid,
      usdBalance: 10000,
      positions: {} // e.g. { "BTC": 0.5, "AAPL": 10 }
    };
    await setDoc(portfolioRef, newPortfolio);
    return newPortfolio;
  }
  return snap.data();
}

// Execute a paper trade
export async function executePaperTrade(symbol, side, quantity, currentPrice) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be logged in to trade");

  if (quantity <= 0) throw new Error("Quantity must be greater than 0");
  
  const cost = quantity * currentPrice;
  const portfolioRef = doc(db, "portfolios", user.uid);
  const snap = await getDoc(portfolioRef);
  
  if (!snap.exists()) throw new Error("Portfolio not found for user.");
  const portfolio = snap.data();

  // Validate the trade
  const currentAssetQty = portfolio.positions[symbol] || 0;
  
  if (side === "BUY") {
    if (portfolio.usdBalance < cost) {
      throw new Error(`Insufficient USD balance. Needed: $${cost.toFixed(2)}`);
    }
    // Deduct balance and add to position
    portfolio.usdBalance -= cost;
    portfolio.positions[symbol] = currentAssetQty + quantity;
  } else if (side === "SELL") {
    if (currentAssetQty < quantity) {
      throw new Error(`Insufficient ${symbol} quantity. You hold ${currentAssetQty}.`);
    }
    // Add to balance and subtract from position
    portfolio.usdBalance += cost;
    portfolio.positions[symbol] = currentAssetQty - quantity;
  }

  // Round balances to prevent floating point UI bugs
  portfolio.usdBalance = Math.round(portfolio.usdBalance * 100) / 100;
  
  // Clean up 0 positions
  if (portfolio.positions[symbol] === 0) {
    delete portfolio.positions[symbol];
  }

  // 1. Update Portfolio
  await updateDoc(portfolioRef, {
    usdBalance: portfolio.usdBalance,
    positions: portfolio.positions
  });

  // 2. Log Trade to Subcollection
  const tradesRef = collection(db, "portfolios", user.uid, "trades");
  await addDoc(tradesRef, {
    userId: user.uid,
    symbol,
    action: side,
    price: currentPrice,
    quantity,
    cost: side === "BUY" ? -cost : cost,
    timestamp: serverTimestamp()
  });

  return portfolio;
}

// Fetch trade history for the current user
export async function getTradeHistory(maxTrades = 50) {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const tradesRef = collection(db, "portfolios", user.uid, "trades");
    const q = query(tradesRef, orderBy("timestamp", "desc"), limit(maxTrades));
    const querySnapshot = await getDocs(q);

    const trades = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      trades.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamp to JS Date
        timestamp: data.timestamp?.toDate?.() || new Date()
      });
    });

    return trades;
  } catch (error) {
    console.error("Error fetching trade history:", error);
    return [];
  }
}
