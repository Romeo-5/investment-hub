'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card';
import { generateMockPortfolioData } from '../../lib/mockData';
import { PortfolioData } from '../../types/portfolio';
import { formatCurrency, formatPercent, formatNumber } from '../../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';

export default function AnalyticsPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    const data = generateMockPortfolioData();
    setPortfolioData(data);
  }, []);

  if (!portfolioData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const { metrics, currentSnapshot, sectorAllocations } = portfolioData;

  // Calculate position-level returns for visualization
  const positionReturns = currentSnapshot.positions
    .map(p => ({
      symbol: p.symbol,
      return: p.gainLossPercent,
      value: p.marketValue,
      volatility: 15 + Math.random() * 25, // Mock volatility data
    }))
    .sort((a, b) => b.return - a.return);

  // Risk metrics data
  const riskMetrics = [
    { name: 'Portfolio', volatility: metrics.volatility, sharpe: metrics.sharpeRatio },
    { name: 'S&P 500', volatility: 18, sharpe: 0.85 },
    { name: 'Nasdaq', volatility: 22, sharpe: 0.92 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Portfolio Analytics</h1>
        <p className="text-gray-600 mt-1">Deep dive into risk metrics, correlations, and optimization insights</p>
      </div>

      {/* Risk Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sharpe Ratio</CardDescription>
            <CardTitle className="text-3xl">{metrics.sharpeRatio.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Risk-adjusted returns</p>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.sharpeRatio > 1 ? 'Excellent' : metrics.sharpeRatio > 0.5 ? 'Good' : 'Below average'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Portfolio Volatility</CardDescription>
            <CardTitle className="text-3xl">{metrics.volatility.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Annualized std dev</p>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.volatility < 15 ? 'Low risk' : metrics.volatility < 25 ? 'Moderate risk' : 'High risk'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Max Drawdown</CardDescription>
            <CardTitle className="text-3xl text-red-600">-{metrics.maxDrawdown.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Largest peak-to-trough decline</p>
            <p className="text-xs text-gray-500 mt-1">Past 12 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Portfolio Beta</CardDescription>
            <CardTitle className="text-3xl">{metrics.beta.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">vs S&P 500</p>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.beta > 1 ? 'More volatile' : metrics.beta < 1 ? 'Less volatile' : 'Market aligned'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Position Returns Analysis */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Position Performance</CardTitle>
          <CardDescription>Return contribution by holding</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={positionReturns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="symbol" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(2)}%`}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                />
                <Bar 
                  dataKey="return" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                >
                  {positionReturns.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.return > 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Risk-Return Scatter */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Risk-Return Profile</CardTitle>
          <CardDescription>Position volatility vs returns (bubble size = market value)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="volatility" 
                  name="Volatility"
                  label={{ value: 'Volatility (%)', position: 'insideBottom', offset: -10 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  type="number" 
                  dataKey="return" 
                  name="Return"
                  label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }}
                  stroke="#6b7280"
                />
                <ZAxis type="number" dataKey="value" range={[100, 1000]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Return') return `${value.toFixed(2)}%`;
                    if (name === 'Volatility') return `${value.toFixed(2)}%`;
                    return formatCurrency(value);
                  }}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                />
                <Scatter 
                  name="Positions" 
                  data={positionReturns} 
                  fill="#3b82f6"
                  shape="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Risk Comparison</CardTitle>
            <CardDescription>Your portfolio vs market benchmarks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskMetrics.map((metric) => (
                <div key={metric.name} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">{metric.name}</span>
                    <span className={`text-sm ${metric.name === 'Portfolio' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
                      Volatility: {metric.volatility.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="w-full bg-gray-100 rounded-full h-2 mr-4">
                      <div 
                        className={`h-2 rounded-full ${metric.name === 'Portfolio' ? 'bg-blue-600' : 'bg-gray-400'}`}
                        style={{ width: `${Math.min((metric.volatility / 30) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      Sharpe: {metric.sharpe.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Concentration Risk</CardTitle>
            <CardDescription>Position size analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentSnapshot.positions.slice(0, 5).map((position) => {
                const totalValue = currentSnapshot.totalValue;
                const percentage = (position.marketValue / totalValue) * 100;
                return (
                  <div key={position.symbol} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">{position.symbol}</span>
                      <span className="text-sm text-gray-600">
                        {percentage.toFixed(1)}% of portfolio
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          percentage > 15 ? 'bg-red-500' : 
                          percentage > 10 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage * 4, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {percentage > 15 ? 'High concentration' : 
                       percentage > 10 ? 'Moderate concentration' : 
                       'Well diversified'}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Insights</CardTitle>
          <CardDescription>AI-powered analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">🎯 Optimization Opportunity</h4>
              <p className="text-sm text-blue-800">
                Your Sharpe ratio of {metrics.sharpeRatio.toFixed(2)} suggests good risk-adjusted returns. 
                Consider rebalancing to maintain this efficiency as market conditions change.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Risk Alert</h4>
              <p className="text-sm text-yellow-800">
                Your portfolio has experienced a maximum drawdown of {metrics.maxDrawdown.toFixed(1)}%. 
                Consider adding defensive positions or hedging strategies during volatile periods.
              </p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">✅ Diversification Status</h4>
              <p className="text-sm text-green-800">
                Your portfolio is spread across {sectorAllocations.length} sectors. 
                This provides good diversification to reduce sector-specific risks.
              </p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">📊 Coming Soon: ML Predictions</h4>
              <p className="text-sm text-purple-800">
                Advanced machine learning models will provide portfolio optimization suggestions, 
                risk forecasting, and anomaly detection once integrated with live data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}