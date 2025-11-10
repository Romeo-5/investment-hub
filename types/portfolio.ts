export interface Position {
  symbol: string;
  name: string;
  quantity: number;
  costBasis: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
  sector: string;
  assetType: 'stock' | 'etf' | 'bond' | 'crypto' | 'cash';
}

export interface Transaction {
  id: string;
  date: Date;
  symbol: string;
  type: 'buy' | 'sell' | 'dividend';
  quantity: number;
  price: number;
  total: number;
  fees: number;
}

export interface PortfolioSnapshot {
  date: Date;
  totalValue: number;
  cashBalance: number;
  positions: Position[];
}

export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercent: number;
  dailyReturn: number;
  dailyReturnPercent: number;
  monthlyReturn: number;
  monthlyReturnPercent: number;
  ytdReturn: number;
  ytdReturnPercent: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  beta: number;
}

export interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  count: number;
}

export interface AssetAllocation {
  assetType: string;
  value: number;
  percentage: number;
}

export interface PortfolioData {
  currentSnapshot: PortfolioSnapshot;
  historicalSnapshots: PortfolioSnapshot[];
  transactions: Transaction[];
  metrics: PerformanceMetrics;
  sectorAllocations: SectorAllocation[];
  assetAllocations: AssetAllocation[];
}