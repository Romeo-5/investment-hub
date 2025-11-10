import { Position, Transaction, PortfolioSnapshot, PerformanceMetrics, SectorAllocation, AssetAllocation, PortfolioData } from '../types/portfolio';

// Mock stock data with realistic sectors
const mockStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', type: 'stock' as const },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', type: 'stock' as const },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', type: 'stock' as const },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', type: 'stock' as const },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', type: 'stock' as const },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services', type: 'stock' as const },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services', type: 'stock' as const },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', type: 'stock' as const },
  { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Defensive', type: 'stock' as const },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', type: 'stock' as const },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', sector: 'Diversified', type: 'etf' as const },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', sector: 'Technology', type: 'etf' as const },
];

function generateRandomPrice(base: number, volatility: number = 0.02): number {
  return base * (1 + (Math.random() - 0.5) * volatility);
}

export function generateMockPositions(): Position[] {
  return mockStocks.slice(0, 10).map((stock, idx) => {
    const basePrice = 100 + idx * 50;
    const quantity = Math.floor(Math.random() * 50) + 10;
    const costBasis = basePrice * quantity;
    const currentPrice = generateRandomPrice(basePrice, 0.15);
    const marketValue = currentPrice * quantity;
    const gainLoss = marketValue - costBasis;
    const gainLossPercent = (gainLoss / costBasis) * 100;

    return {
      symbol: stock.symbol,
      name: stock.name,
      quantity,
      costBasis: costBasis / quantity,
      currentPrice,
      marketValue,
      gainLoss,
      gainLossPercent,
      sector: stock.sector,
      assetType: stock.type,
    };
  });
}

export function generateMockTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const stocks = mockStocks.slice(0, 8);
  
  // Generate transactions over the past year
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 365);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    const stock = stocks[Math.floor(Math.random() * stocks.length)];
    const isBuy = Math.random() > 0.3; // 70% buy, 30% sell
    const quantity = Math.floor(Math.random() * 20) + 1;
    const price = 100 + Math.random() * 300;
    const total = quantity * price;
    
    transactions.push({
      id: `txn-${i}`,
      date,
      symbol: stock.symbol,
      type: isBuy ? 'buy' : 'sell',
      quantity,
      price,
      total,
      fees: total * 0.001, // 0.1% fees
    });
  }
  
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function generateMockHistoricalSnapshots(positions: Position[]): PortfolioSnapshot[] {
  const snapshots: PortfolioSnapshot[] = [];
  const daysBack = 365;
  const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
  
  for (let i = daysBack; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simulate portfolio growth with some volatility
    const growthFactor = 1 + (daysBack - i) * 0.0003 + (Math.random() - 0.5) * 0.02;
    const snapshotValue = totalValue / growthFactor;
    
    snapshots.push({
      date,
      totalValue: snapshotValue,
      cashBalance: 5000 + Math.random() * 2000,
      positions: positions.map(p => ({
        ...p,
        currentPrice: p.currentPrice / growthFactor,
        marketValue: p.marketValue / growthFactor,
      })),
    });
  }
  
  return snapshots;
}

export function calculateMockMetrics(positions: Position[], snapshots: PortfolioSnapshot[]): PerformanceMetrics {
  const currentValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
  const totalCost = positions.reduce((sum, p) => sum + p.costBasis * p.quantity, 0);
  
  // Calculate returns
  const totalReturn = currentValue - totalCost;
  const totalReturnPercent = (totalReturn / totalCost) * 100;
  
  // Daily return
  const yesterdayValue = snapshots[snapshots.length - 2]?.totalValue || currentValue;
  const dailyReturn = currentValue - yesterdayValue;
  const dailyReturnPercent = (dailyReturn / yesterdayValue) * 100;
  
  // Monthly return (30 days ago)
  const monthAgoValue = snapshots[snapshots.length - 30]?.totalValue || currentValue;
  const monthlyReturn = currentValue - monthAgoValue;
  const monthlyReturnPercent = (monthlyReturn / monthAgoValue) * 100;
  
  // YTD return
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const ytdSnapshot = snapshots.find(s => s.date >= yearStart) || snapshots[0];
  const ytdReturn = currentValue - ytdSnapshot.totalValue;
  const ytdReturnPercent = (ytdReturn / ytdSnapshot.totalValue) * 100;
  
  // Calculate volatility (annualized standard deviation of daily returns)
  const dailyReturns = snapshots.slice(1).map((snapshot, idx) => {
    const prevValue = snapshots[idx].totalValue;
    return (snapshot.totalValue - prevValue) / prevValue;
  });
  
  const avgReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length;
  const volatility = Math.sqrt(variance * 252) * 100; // Annualized
  
  // Sharpe Ratio (assuming 4% risk-free rate)
  const riskFreeRate = 0.04;
  const excessReturn = totalReturnPercent / 100 - riskFreeRate;
  const sharpeRatio = excessReturn / (volatility / 100);
  
  // Max Drawdown
  let maxDrawdown = 0;
  let peak = snapshots[0].totalValue;
  
  snapshots.forEach(snapshot => {
    if (snapshot.totalValue > peak) {
      peak = snapshot.totalValue;
    }
    const drawdown = (peak - snapshot.totalValue) / peak * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });
  
  return {
    totalReturn,
    totalReturnPercent,
    dailyReturn,
    dailyReturnPercent,
    monthlyReturn,
    monthlyReturnPercent,
    ytdReturn,
    ytdReturnPercent,
    volatility,
    sharpeRatio,
    maxDrawdown,
    beta: 0.95, // Mock beta vs S&P 500
  };
}

export function calculateSectorAllocations(positions: Position[]): SectorAllocation[] {
  const sectorMap = new Map<string, { value: number; count: number }>();
  const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
  
  positions.forEach(position => {
    const existing = sectorMap.get(position.sector) || { value: 0, count: 0 };
    sectorMap.set(position.sector, {
      value: existing.value + position.marketValue,
      count: existing.count + 1,
    });
  });
  
  return Array.from(sectorMap.entries()).map(([sector, data]) => ({
    sector,
    value: data.value,
    percentage: (data.value / totalValue) * 100,
    count: data.count,
  })).sort((a, b) => b.value - a.value);
}

export function calculateAssetAllocations(positions: Position[]): AssetAllocation[] {
  const assetMap = new Map<string, number>();
  const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
  
  positions.forEach(position => {
    const existing = assetMap.get(position.assetType) || 0;
    assetMap.set(position.assetType, existing + position.marketValue);
  });
  
  return Array.from(assetMap.entries()).map(([assetType, value]) => ({
    assetType,
    value,
    percentage: (value / totalValue) * 100,
  })).sort((a, b) => b.value - a.value);
}

export function generateMockPortfolioData(): PortfolioData {
  const positions = generateMockPositions();
  const transactions = generateMockTransactions();
  const historicalSnapshots = generateMockHistoricalSnapshots(positions);
  const metrics = calculateMockMetrics(positions, historicalSnapshots);
  const sectorAllocations = calculateSectorAllocations(positions);
  const assetAllocations = calculateAssetAllocations(positions);
  
  const currentSnapshot: PortfolioSnapshot = {
    date: new Date(),
    totalValue: positions.reduce((sum, p) => sum + p.marketValue, 0),
    cashBalance: 7500,
    positions,
  };
  
  return {
    currentSnapshot,
    historicalSnapshots,
    transactions,
    metrics,
    sectorAllocations,
    assetAllocations,
  };
}