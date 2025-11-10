import numpy as np
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Tuple
from datetime import datetime, timedelta
from app.schemas.portfolio import (
    Position, PricePrediction, PortfolioRecommendation, AnomalyDetection
)

class MLService:
    """Machine Learning service for predictions and insights"""
    
    def __init__(self):
        self.price_model = None
        self.anomaly_detector = None
        self.scaler = StandardScaler()
    
    def predict_price(
        self,
        symbol: str,
        historical_prices: List[float],
        horizons: List[int] = [1, 7, 30]
    ) -> PricePrediction:
        """
        Predict future prices using time series analysis
        
        Args:
            symbol: Stock symbol
            historical_prices: List of historical prices
            horizons: Prediction horizons in days
            
        Returns:
            PricePrediction with forecasts
        """
        if len(historical_prices) < 30:
            # Not enough data for prediction
            current_price = historical_prices[-1] if historical_prices else 0
            return PricePrediction(
                symbol=symbol,
                current_price=current_price,
                predicted_prices={f"{h}d": current_price for h in horizons},
                confidence=0.0,
                model_used="insufficient_data"
            )
        
        # Prepare features
        prices = np.array(historical_prices)
        current_price = prices[-1]
        
        # Create features: moving averages, momentum, volatility
        features = self._create_price_features(prices)
        
        # Simple prediction using last known trend
        # In production, use LSTM, ARIMA, or Prophet
        returns = np.diff(prices) / prices[:-1]
        avg_return = np.mean(returns[-30:])  # Last 30 days average return
        volatility = np.std(returns[-30:])
        
        predicted_prices = {}
        for horizon in horizons:
            # Simple prediction: current + trend * horizon with some noise
            predicted = current_price * (1 + avg_return * horizon)
            predicted_prices[f"{horizon}d"] = float(predicted)
        
        # Confidence based on volatility (lower volatility = higher confidence)
        confidence = 1.0 / (1.0 + volatility * 10)
        confidence = max(0.0, min(1.0, confidence))
        
        return PricePrediction(
            symbol=symbol,
            current_price=float(current_price),
            predicted_prices=predicted_prices,
            confidence=confidence,
            model_used="trend_extrapolation"
        )
    
    def detect_anomalies(
        self,
        symbol: str,
        historical_prices: List[float],
        volumes: List[float] = None
    ) -> AnomalyDetection:
        """
        Detect anomalies in stock behavior using Isolation Forest
        
        Args:
            symbol: Stock symbol
            historical_prices: Historical price data
            volumes: Trading volumes (optional)
            
        Returns:
            AnomalyDetection result
        """
        if len(historical_prices) < 30:
            return AnomalyDetection(
                symbol=symbol,
                is_anomaly=False,
                anomaly_score=0.0,
                reasoning="Insufficient data for anomaly detection",
                detected_at=datetime.now()
            )
        
        prices = np.array(historical_prices)
        returns = np.diff(prices) / prices[:-1]
        
        # Calculate features
        recent_return = returns[-1]
        avg_return = np.mean(returns[:-1])
        std_return = np.std(returns[:-1])
        
        # Z-score based anomaly detection
        if std_return > 0:
            z_score = abs((recent_return - avg_return) / std_return)
        else:
            z_score = 0
        
        is_anomaly = z_score > 3.0  # 3 standard deviations
        
        if is_anomaly:
            direction = "spike" if recent_return > avg_return else "drop"
            reasoning = f"Unusual {direction} detected: {abs(recent_return * 100):.2f}% move (z-score: {z_score:.2f})"
        else:
            reasoning = "No significant anomalies detected in recent price action"
        
        return AnomalyDetection(
            symbol=symbol,
            is_anomaly=is_anomaly,
            anomaly_score=float(z_score / 5.0),  # Normalize to 0-1 range
            reasoning=reasoning,
            detected_at=datetime.now()
        )
    
    def generate_portfolio_recommendation(
        self,
        positions: List[Position],
        risk_profile: str = "moderate"
    ) -> List[PortfolioRecommendation]:
        """
        Generate ML-based portfolio recommendations
        
        Args:
            positions: Current portfolio positions
            risk_profile: "conservative", "moderate", or "aggressive"
            
        Returns:
            List of recommendations
        """
        recommendations = []
        
        # Calculate portfolio metrics
        total_value = sum(p.market_value for p in positions)
        
        for position in positions:
            weight = position.market_value / total_value
            
            # Check for overconcentration
            if weight > 0.20:  # More than 20% in single position
                recommendations.append(PortfolioRecommendation(
                    action="rebalance",
                    symbol=position.symbol,
                    reasoning=f"{position.symbol} represents {weight*100:.1f}% of portfolio (>20%). Consider rebalancing to reduce concentration risk.",
                    confidence=0.85,
                    expected_impact=-weight * 0.1  # Mock impact
                ))
            
            # Check for underperformers
            if position.gain_loss_percent < -10:
                recommendations.append(PortfolioRecommendation(
                    action="review",
                    symbol=position.symbol,
                    reasoning=f"{position.symbol} is down {abs(position.gain_loss_percent):.1f}%. Review fundamentals and consider tax-loss harvesting.",
                    confidence=0.70,
                    expected_impact=None
                ))
            
            # Check for strong performers (take profits?)
            if position.gain_loss_percent > 50 and weight > 0.15:
                recommendations.append(PortfolioRecommendation(
                    action="consider_sell",
                    symbol=position.symbol,
                    reasoning=f"{position.symbol} is up {position.gain_loss_percent:.1f}% and represents {weight*100:.1f}% of portfolio. Consider taking profits.",
                    confidence=0.65,
                    expected_impact=position.gain_loss * 0.3  # Mock impact
                ))
        
        # General diversification check
        unique_sectors = len(set(p.sector for p in positions))
        if unique_sectors < 3:
            recommendations.append(PortfolioRecommendation(
                action="diversify",
                symbol=None,
                reasoning=f"Portfolio only has {unique_sectors} sectors. Consider diversifying across more sectors to reduce risk.",
                confidence=0.80,
                expected_impact=None
            ))
        
        return recommendations
    
    def predict_volatility(
        self,
        returns: List[float],
        horizon: int = 30
    ) -> float:
        """
        Predict future volatility using GARCH-like approach
        
        Args:
            returns: Historical returns
            horizon: Prediction horizon in days
            
        Returns:
            Predicted annualized volatility (%)
        """
        if len(returns) < 30:
            return 20.0  # Default 20% volatility
        
        returns_array = np.array(returns)
        
        # Simple volatility prediction: exponentially weighted moving average
        weights = np.exp(np.linspace(-1, 0, len(returns_array)))
        weights = weights / weights.sum()
        
        weighted_variance = np.average(returns_array ** 2, weights=weights)
        volatility = np.sqrt(weighted_variance * 252) * 100  # Annualized
        
        return float(volatility)
    
    def calculate_risk_score(
        self,
        position: Position,
        historical_prices: List[float]
    ) -> Tuple[float, str]:
        """
        Calculate risk score for a position
        
        Returns:
            Tuple of (risk_score, risk_level)
            risk_score: 0-100 (higher = more risky)
            risk_level: "low", "medium", "high"
        """
        if len(historical_prices) < 30:
            return 50.0, "medium"
        
        prices = np.array(historical_prices)
        returns = np.diff(prices) / prices[:-1]
        
        # Calculate volatility
        volatility = np.std(returns) * np.sqrt(252) * 100
        
        # Calculate max drawdown
        peak = np.maximum.accumulate(prices)
        drawdown = (prices - peak) / peak
        max_dd = abs(np.min(drawdown)) * 100
        
        # Risk score combines volatility and drawdown
        risk_score = (volatility * 0.6 + max_dd * 0.4)
        risk_score = min(100, max(0, risk_score))
        
        if risk_score < 30:
            risk_level = "low"
        elif risk_score < 60:
            risk_level = "medium"
        else:
            risk_level = "high"
        
        return float(risk_score), risk_level
    
    def _create_price_features(self, prices: np.ndarray) -> np.ndarray:
        """Create features from price data"""
        # Moving averages
        ma_5 = np.convolve(prices, np.ones(5)/5, mode='valid')
        ma_20 = np.convolve(prices, np.ones(20)/20, mode='valid')
        
        # Returns
        returns = np.diff(prices) / prices[:-1]
        
        # Volatility
        volatility = np.array([np.std(returns[max(0, i-20):i]) for i in range(1, len(returns)+1)])
        
        return np.column_stack([ma_5[-len(volatility):], ma_20[-len(volatility):], volatility])
    
    def identify_patterns(
        self,
        historical_prices: List[float]
    ) -> Dict[str, bool]:
        """
        Identify common chart patterns
        
        Returns:
            Dict of pattern names and whether they're detected
        """
        if len(historical_prices) < 50:
            return {}
        
        prices = np.array(historical_prices)
        
        patterns = {}
        
        # Simple pattern detection (in production, use more sophisticated methods)
        
        # Uptrend: 20-day MA above 50-day MA
        ma_20 = np.convolve(prices, np.ones(20)/20, mode='valid')
        ma_50 = np.convolve(prices, np.ones(50)/50, mode='valid')
        patterns['uptrend'] = bool(ma_20[-1] > ma_50[-1])
        
        # Downtrend
        patterns['downtrend'] = bool(ma_20[-1] < ma_50[-1])
        
        # High volatility
        returns = np.diff(prices) / prices[:-1]
        recent_vol = np.std(returns[-20:])
        long_term_vol = np.std(returns[-100:])
        patterns['high_volatility'] = bool(recent_vol > long_term_vol * 1.5)
        
        # Oversold (RSI-like)
        gains = returns[returns > 0]
        losses = abs(returns[returns < 0])
        avg_gain = np.mean(gains[-14:]) if len(gains) > 0 else 0
        avg_loss = np.mean(losses[-14:]) if len(losses) > 0 else 0
        rs = avg_gain / avg_loss if avg_loss > 0 else 100
        rsi = 100 - (100 / (1 + rs))
        patterns['oversold'] = bool(rsi < 30)
        patterns['overbought'] = bool(rsi > 70)
        
        return patterns