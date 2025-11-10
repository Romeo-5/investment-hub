from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class AssetType(str, Enum):
    """Asset type enumeration"""
    STOCK = "stock"
    ETF = "etf"
    BOND = "bond"
    CRYPTO = "crypto"
    CASH = "cash"

class TransactionType(str, Enum):
    """Transaction type enumeration"""
    BUY = "buy"
    SELL = "sell"
    DIVIDEND = "dividend"

# Position Models
class Position(BaseModel):
    """Position/Holding model"""
    symbol: str
    name: str
    quantity: float
    cost_basis: float
    current_price: float
    market_value: float
    gain_loss: float
    gain_loss_percent: float
    sector: str
    asset_type: AssetType

class PositionDetail(Position):
    """Detailed position with additional metrics"""
    day_change: float
    day_change_percent: float
    portfolio_weight: float
    beta: Optional[float] = None
    volatility: Optional[float] = None

# Transaction Models
class Transaction(BaseModel):
    """Transaction model"""
    id: str
    date: datetime
    symbol: str
    type: TransactionType
    quantity: float
    price: float
    total: float
    fees: float

# Portfolio Models
class PortfolioSnapshot(BaseModel):
    """Portfolio snapshot at a point in time"""
    date: datetime
    total_value: float
    cash_balance: float
    positions: List[Position]

class PerformanceMetrics(BaseModel):
    """Portfolio performance metrics"""
    total_return: float
    total_return_percent: float
    daily_return: float
    daily_return_percent: float
    monthly_return: float
    monthly_return_percent: float
    ytd_return: float
    ytd_return_percent: float
    volatility: float
    sharpe_ratio: float
    max_drawdown: float
    beta: float

class SectorAllocation(BaseModel):
    """Sector allocation breakdown"""
    sector: str
    value: float
    percentage: float
    count: int

class AssetAllocation(BaseModel):
    """Asset type allocation breakdown"""
    asset_type: str
    value: float
    percentage: float

class PortfolioSummary(BaseModel):
    """Complete portfolio summary"""
    current_snapshot: PortfolioSnapshot
    historical_snapshots: List[PortfolioSnapshot]
    transactions: List[Transaction]
    metrics: PerformanceMetrics
    sector_allocations: List[SectorAllocation]
    asset_allocations: List[AssetAllocation]

# Analytics Request/Response Models
class OptimizationRequest(BaseModel):
    """Portfolio optimization request"""
    risk_tolerance: float = Field(ge=0, le=1, description="Risk tolerance (0=conservative, 1=aggressive)")
    target_return: Optional[float] = None
    constraints: Optional[dict] = None

class OptimizationResponse(BaseModel):
    """Portfolio optimization results"""
    recommended_weights: dict[str, float]
    expected_return: float
    expected_volatility: float
    sharpe_ratio: float
    current_allocation: dict[str, float]

class RiskAnalysis(BaseModel):
    """Risk analysis results"""
    var_95: float  # Value at Risk at 95% confidence
    var_99: float  # Value at Risk at 99% confidence
    cvar_95: float  # Conditional VaR
    volatility: float
    max_drawdown: float
    correlation_matrix: Optional[dict] = None

# Market Data Models
class StockQuote(BaseModel):
    """Stock quote data"""
    symbol: str
    price: float
    change: float
    change_percent: float
    volume: int
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None

class MarketIndex(BaseModel):
    """Market index data"""
    name: str
    symbol: str
    value: float
    change: float
    change_percent: float

# ML Prediction Models
class PricePrediction(BaseModel):
    """Price prediction model"""
    symbol: str
    current_price: float
    predicted_prices: dict[str, float]  # e.g., {"1d": 150.5, "7d": 152.3, "30d": 155.0}
    confidence: float
    model_used: str

class PortfolioRecommendation(BaseModel):
    """ML-based portfolio recommendation"""
    action: str  # "buy", "sell", "hold", "rebalance"
    symbol: Optional[str] = None
    reasoning: str
    confidence: float
    expected_impact: Optional[float] = None

class AnomalyDetection(BaseModel):
    """Anomaly detection results"""
    symbol: str
    is_anomaly: bool
    anomaly_score: float
    reasoning: str
    detected_at: datetime