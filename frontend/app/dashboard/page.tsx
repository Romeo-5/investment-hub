'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card';
import { generateMockPortfolioData } from '../../lib/mockData';
import { PortfolioData } from '../../types/portfolio';
import { formatCurrency, formatPercent, getReturnColor } from '../../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function DashboardPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    // In production, this would fetch from your API
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

  const { currentSnapshot, metrics, sectorAllocations, assetAllocations, historicalSnapshots } = portfolioData;
  const totalValue = currentSnapshot.totalValue + currentSnapshot.cashBalance;

  // Prepare chart data
  const performanceData = historicalSnapshots
    .filter((_, idx) => idx % 7 === 0) // Sample every 7 days for cleaner chart
    .map(snapshot => ({
      date: snapshot.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: snapshot.totalValue + snapshot.cashBalance,
    }));

  const sectorChartData = sectorAllocations.map(sector => ({
    name: sector.sector,
    value: sector.value,
    percentage: sector.percentage,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Portfolio Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your investment performance and holdings</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Portfolio Value</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(totalValue)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-sm font-medium ${getReturnColor(metrics.dailyReturn)}`}>
              {formatPercent(metrics.dailyReturnPercent)} today
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Return</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(metrics.totalReturn)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-sm font-medium ${getReturnColor(metrics.totalReturn)}`}>
              {formatPercent(metrics.totalReturnPercent)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>YTD Return</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(metrics.ytdReturn)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-sm font-medium ${getReturnColor(metrics.ytdReturn)}`}>
              {formatPercent(metrics.ytdReturnPercent)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cash Balance</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(currentSnapshot.cashBalance)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              {((currentSnapshot.cashBalance / totalValue) * 100).toFixed(1)}% of portfolio
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Performance Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>Historical value over the past year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Allocation Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Sector Allocation</CardTitle>
            <CardDescription>Distribution across sectors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sectorChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Type Allocation</CardTitle>
            <CardDescription>Distribution by asset class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocations}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ assetType, percentage }) => `${assetType} ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetAllocations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Top Holdings</CardTitle>
          <CardDescription>Your largest positions by market value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Symbol</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Name</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Shares</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Market Value</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Gain/Loss</th>
                </tr>
              </thead>
              <tbody>
                {currentSnapshot.positions.slice(0, 5).map((position) => (
                  <tr key={position.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-sm">{position.symbol}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{position.name}</td>
                    <td className="py-3 px-4 text-right text-sm">{position.quantity}</td>
                    <td className="py-3 px-4 text-right text-sm">{formatCurrency(position.currentPrice)}</td>
                    <td className="py-3 px-4 text-right text-sm font-medium">{formatCurrency(position.marketValue)}</td>
                    <td className={`py-3 px-4 text-right text-sm font-medium ${getReturnColor(position.gainLoss)}`}>
                      {formatCurrency(position.gainLoss)} ({formatPercent(position.gainLossPercent)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}