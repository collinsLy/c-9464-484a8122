import React, { useState, useEffect } from 'react';
// Assuming BinanceService is defined elsewhere
class BinanceService {
  async get24hrTicker(symbol) {
    // Replace with your actual Binance API call
    // This is a placeholder, you need to implement the actual API call here.
    //  Consider using a library like axios for making HTTP requests.
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
    const data = await response.json();
    return data;
  }
}

function MarketChart({ selectedSymbol }) {
  const [price, setPrice] = useState("0");
  const [priceChange, setPriceChange] = useState("0");
  const [priceChangePercent, setPriceChangePercent] = useState("0%");
  const binanceService = new BinanceService();

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const ticker = await binanceService.get24hrTicker(selectedSymbol);
        const currentPrice = parseFloat(ticker.lastPrice).toLocaleString();
        const change = parseFloat(ticker.priceChange).toFixed(2);
        const changePercent = parseFloat(ticker.priceChangePercent).toFixed(2);

        setPrice(currentPrice);
        setPriceChange((change > 0 ? "+" : "") + change);
        setPriceChangePercent((changePercent > 0 ? "+" : "") + changePercent + "%");
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    };

    fetchPriceData();
    const interval = setInterval(fetchPriceData, 1000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  return (
    <div>
      <h1>Current Price: {price}</h1>
      <p>24h Change: {priceChange} ({priceChangePercent})</p>
      {/* Rest of your MarketChart component */}
    </div>
  );
}

export default MarketChart;