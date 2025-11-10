import numpy as np
import pandas as pd
from typing import List, Dict, Tuple
from datetime import datetime, timedelta
from app.schemas.portfolio import (
    Position, PortfolioSnapshot, PerformanceMetrics,
    RiskAnalysis, OptimizationResponse
)

class PortfolioAnalytics:
    """Portfolio analytics and calculations service"""
    
    @staticmethod
    def calculate_returns(
        historical_values: List[float],
        period: str = "daily"
    ) -> List[float]:
        """Calculate returns for a series of portfolio values"""
        values = np.array(historical_values)
        returns = np.diff(values) / values[:-1]
        return returns.tolist()
    
    @staticmethod
    def calculate_volatility(returns: List[float], annualize: bool = True) -> float:
        """Calculate portfolio volatility (standard deviation of returns)"""
        if not returns:
            return 0.0
        
        std = np.std(returns)
        
        if annualize:
            # Annualize assuming 252 trading days
            std = std * np.sqrt(252)
        
        return float(std * 100)  # Return as percentage
    
    @staticmethod
    def calculate_sharpe_ratio(
        returns: List[float],
        risk_free_rate: float = 0.04
    ) -> float:
        """
        Calculate Sharpe ratio
        
        Args:
            returns: List of daily returns
            risk_free_rate: Annual risk-free rate (default 4%)
        """
        if not returns:
            return 0.0
        
        returns_array = np.array(returns)
        
        # Annualized return
        mean_return = np.mean(returns_array) * 252
        
        # Annualized volatility
        volatility = np.std(returns_array) * np.sqrt(252)
        
        if volatility == 0:
            return 0.0
        
        # Sharpe ratio
        sharpe = (mean_return - risk_free_rate) / volatility
        return float(sharpe)
    
    @staticmethod
    def calculate_max_drawdown(historical_values: List[float]) -> float:
        """Calculate maximum drawdown"""
        if not historical_values:
            return 0.0
        
        values = np.array(historical_values)
        peak = np.maximum.accumulate(values)
        drawdown = (values - peak) / peak
        max_dd = np.min(drawdown)
        
        return float(abs(max_dd) * 100)  # Return as percentage
    
    @staticmethod
    def calculate_var(
        returns: List[float],
        confidence_level: float = 0.95
    ) -> float:
        """
        Calculate Value at Risk (VaR)
        
        Args:
            returns: List of returns
            confidence_level: Confidence level (0.95 for 95%, 0.99 for 99%)
        """
        if not returns:
            return 0.0
        
        returns_array = np.array(returns)
        var = np.percentile(returns_array, (1 - confidence_level) * 100)
        
        return float(abs(var) * 100)
    
    @staticmethod
    def calculate_cvar(
        returns: List[float],
        confidence_level: float = 0.95
    ) -> float:
        """
        Calculate Conditional Value at Risk (CVaR/Expected Shortfall)
        
        Args:
            returns: List of returns
            confidence_level: Confidence level
        """
        if not returns:
            return 0.0
        
        returns_array = np.array(returns)
        var_threshold = np.percentile(returns_array, (1 - confidence_level) * 100)
        
        # Average of returns below VaR threshold
        tail_returns = returns_array[returns_array <= var_threshold]
        
        if len(tail_returns) == 0:
            return 0.0
        
        cvar = np.mean(tail_returns)
        return float(abs(cvar) * 100)
    
    @staticmethod
    def calculate_beta(
        asset_returns: List[float],
        market_returns: List[float]
    ) -> float:
        """Calculate beta (systematic risk relative to market)"""
        if not asset_returns or not market_returns:
            return 1.0
        
        # Ensure same length
        min_len = min(len(asset_returns), len(market_returns))
        asset_returns = np.array(asset_returns[:min_len])
        market_returns = np.array(market_returns[:min_len])
        
        # Covariance between asset and market
        covariance = np.cov(asset_returns, market_returns)[0][1]
        
        # Variance of market
        market_variance = np.var(market_returns)
        
        if market_variance == 0:
            return 1.0
        
        beta = covariance / market_variance
        return float(beta)
    
    @staticmethod
    def calculate_correlation_matrix(
        positions: List[Position],
        historical_prices: Dict[str, List[float]]
    ) -> Dict[str, Dict[str, float]]:
        """Calculate correlation matrix between positions"""
        symbols = [p.symbol for p in positions]
        
        # Create DataFrame of returns
        returns_data = {}
        for symbol in symbols:
            if symbol in historical_prices and len(historical_prices[symbol]) > 1:
                prices = np.array(historical_prices[symbol])
                returns = np.diff(prices) / prices[:-1]
                returns_data[symbol] = returns
        
        if not returns_data:
            return {}
        
        # Create DataFrame
        df = pd.DataFrame(returns_data)
        
        # Calculate correlation matrix
        corr_matrix = df.corr()
        
        # Convert to dictionary
        return corr_matrix.to_dict()
    
    @staticmethod
    def optimize_portfolio(
        positions: List[Position],
        risk_tolerance: float = 0.5,
        target_return: float = None
    ) -> OptimizationResponse:
        """
        Optimize portfolio allocation using Modern Portfolio Theory
        
        Args:
            positions: Current positions
            risk_tolerance: 0 (conservative) to 1 (aggressive)
            target_return: Target annual return (optional)
        """
        # This is a simplified optimization
        # In production, use scipy.optimize or PyPortfolioOpt
        
        total_value = sum(p.market_value for p in positions)
        current_weights = {
            p.symbol: p.market_value / total_value 
            for p in positions
        }
        
        # Mock optimization based on risk-adjusted returns
        returns = {p.symbol: p.gain_loss_percent / 100 for p in positions}
        
        # Simple optimization: weight by Sharpe-like metric
        # In production, use proper mean-variance optimization
        scores = {}
        for p in positions:
            # Mock score based on return and volatility (assumed)
            volatility = 0.20  # Mock 20% volatility
            score = (p.gain_loss_percent / 100) / volatility
            scores[p.symbol] = max(score, 0)
        
        total_score = sum(scores.values())
        
        if total_score == 0:
            # Equal weight if no positive scores
            recommended_weights = {s: 1.0 / len(positions) for s in scores.keys()}
        else:
            # Weight by score, adjusted for risk tolerance
            base_weights = {s: score / total_score for s, score in scores.items()}
            
            # Adjust for risk tolerance (more aggressive = more concentration)
            if risk_tolerance < 0.5:
                # More conservative = more equal weights
                equal_weight = 1.0 / len(positions)
                recommended_weights = {
                    s: w * risk_tolerance * 2 + equal_weight * (1 - risk_tolerance * 2)
                    for s, w in base_weights.items()
                }
            else:
                recommended_weights = base_weights
        
        # Normalize weights
        total_weight = sum(recommended_weights.values())
        recommended_weights = {
            s: w / total_weight 
            for s, w in recommended_weights.items()
        }
        
        # Calculate expected metrics
        expected_return = sum(
            returns.get(s, 0) * w 
            for s, w in recommended_weights.items()
        )
        
        expected_volatility = 0.18  # Mock volatility
        sharpe = expected_return / expected_volatility if expected_volatility > 0 else 0
        
        return OptimizationResponse(
            recommended_weights=recommended_weights,
            expected_return=expected_return * 100,
            expected_volatility=expected_volatility * 100,
            sharpe_ratio=sharpe,
            current_allocation=current_weights
        )
    
    @staticmethod
    def calculate_risk_metrics(
        historical_values: List[float],
        returns: List[float]
    ) -> RiskAnalysis:
        """Calculate comprehensive risk metrics"""
        var_95 = PortfolioAnalytics.calculate_var(returns, 0.95)
        var_99 = PortfolioAnalytics.calculate_var(returns, 0.99)
        cvar_95 = PortfolioAnalytics.calculate_cvar(returns, 0.95)
        volatility = PortfolioAnalytics.calculate_volatility(returns)
        max_drawdown = PortfolioAnalytics.calculate_max_drawdown(historical_values)
        
        return RiskAnalysis(
            var_95=var_95,
            var_99=var_99,
            cvar_95=cvar_95,
            volatility=volatility,
            max_drawdown=max_drawdown
        )