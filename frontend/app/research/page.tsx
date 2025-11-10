'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card';
import { formatCurrency, formatPercent, getReturnColor } from '../../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

// Mock stock data for screening
interface StockData {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  pe: number;
  dividend: number;
  volume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

const mockStockData: StockData[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', price: 178.50, change: 2.35, changePercent: 1.33, marketCap: 2800000000000, pe: 29.5, dividend: 0.96, volume: 52000000, fiftyTwoWeekHigh: 198.23, fiftyTwoWeekLow: 164.08 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', price: 378.91, change: 5.12, changePercent: 1.37, marketCap: 2820000000000, pe: 35.2, dividend: 3.00, volume: 28000000, fiftyTwoWeekHigh: 384.30, fiftyTwoWeekLow: 309.45 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', price: 141.80, change: -1.20, changePercent: -0.84, marketCap: 1780000000000, pe: 26.8, dividend: 0, volume: 25000000, fiftyTwoWeekHigh: 153.78, fiftyTwoWeekLow: 121.46 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', price: 178.25, change: 3.45, changePercent: 1.97, marketCap: 1850000000000, pe: 78.4, dividend: 0, volume: 45000000, fiftyTwoWeekHigh: 188.65, fiftyTwoWeekLow: 139.52 },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical', price: 238.45, change: -5.23, changePercent: -2.15, marketCap: 758000000000, pe: 68.9, dividend: 0, volume: 98000000, fiftyTwoWeekHigh: 299.29, fiftyTwoWeekLow: 152.37 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', price: 495.22, change: 12.34, changePercent: 2.55, marketCap: 1220000000000, pe: 71.2, dividend: 0.16, volume: 48000000, fiftyTwoWeekHigh: 502.66, fiftyTwoWeekLow: 338.77 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services', price: 179.34, change: 1.89, changePercent: 1.06, marketCap: 520000000000, pe: 11.3, dividend: 4.20, volume: 12000000, fiftyTwoWeekHigh: 189.11, fiftyTwoWeekLow: 135.19 },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services', price: 268.91, change: 2.45, changePercent: 0.92, marketCap: 548000000000, pe: 32.1, dividend: 2.08, volume: 8000000, fiftyTwoWeekHigh: 276.41, fiftyTwoWeekLow: 227.64 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', price: 156.78, change: -0.45, changePercent: -0.29, marketCap: 386000000000, pe: 24.6, dividend: 4.76, volume: 7000000, fiftyTwoWeekHigh: 169.94, fiftyTwoWeekLow: 143.13 },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Healthcare', price: 524.67, change: 6.78, changePercent: 1.31, marketCap: 487000000000, pe: 22.8, dividend: 7.48, volume: 3000000, fiftyTwoWeekHigh: 558.10, fiftyTwoWeekLow: 445.68 },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', price: 102.45, change: -1.23, changePercent: -1.19, marketCap: 418000000000, pe: 9.7, dividend: 3.60, volume: 18000000, fiftyTwoWeekHigh: 120.20, fiftyTwoWeekLow: 95.63 },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy', price: 156.89, change: -2.34, changePercent: -1.47, marketCap: 287000000000, pe: 10.9, dividend: 6.04, volume: 9000000, fiftyTwoWeekHigh: 174.76, fiftyTwoWeekLow: 135.37 },
  { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Defensive', price: 168.34, change: 0.89, changePercent: 0.53, marketCap: 397000000000, pe: 26.4, dividend: 3.76, volume: 6000000, fiftyTwoWeekHigh: 172.09, fiftyTwoWeekLow: 144.39 },
  { symbol: 'KO', name: 'The Coca-Cola Company', sector: 'Consumer Defensive', price: 62.78, change: 0.34, changePercent: 0.54, marketCap: 271000000000, pe: 26.1, dividend: 1.94, volume: 14000000, fiftyTwoWeekHigh: 65.77, fiftyTwoWeekLow: 56.32 },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive', price: 67.89, change: 1.23, changePercent: 1.85, marketCap: 447000000000, pe: 32.5, dividend: 0.81, volume: 8000000, fiftyTwoWeekHigh: 69.47, fiftyTwoWeekLow: 49.85 },
];

// Market indices data
const marketIndices = [
  { name: 'S&P 500', value: 4783.45, change: 32.18, changePercent: 0.68 },
  { name: 'Dow Jones', value: 37440.34, change: 201.94, changePercent: 0.54 },
  { name: 'Nasdaq', value: 14963.87, change: 159.05, changePercent: 1.07 },
  { name: 'Russell 2000', value: 2027.07, change: -5.34, changePercent: -0.26 },
];

export default function ResearchPage() {
  const [selectedStocks, setSelectedStocks] = useState<string[]>(['AAPL', 'MSFT']);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSector, setFilterSector] = useState('all');
  const [minMarketCap, setMinMarketCap] = useState(0);
  const [maxPE, setMaxPE] = useState(100);
  const [minDividend, setMinDividend] = useState(0);
  const [sortBy, setSortBy] = useState<keyof StockData>('marketCap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Get unique sectors
  const uniqueSectors = Array.from(new Set(mockStockData.map(s => s.sector)));

  // Filter and sort stocks
  let filteredStocks = mockStockData.filter(stock => {
    const matchesSearch = searchQuery === '' || 
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = filterSector === 'all' || stock.sector === filterSector;
    const matchesMarketCap = stock.marketCap >= minMarketCap * 1000000000;
    const matchesPE = stock.pe <= maxPE;
    const matchesDividend = stock.dividend >= minDividend;
    
    return matchesSearch && matchesSector && matchesMarketCap && matchesPE && matchesDividend;
  });

  filteredStocks = [...filteredStocks].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Comparison data for selected stocks
  const comparisonStocks = mockStockData.filter(s => selectedStocks.includes(s.symbol));
  
  const comparisonData = [
    {
      metric: 'P/E Ratio',
      ...comparisonStocks.reduce((acc, stock) => ({ ...acc, [stock.symbol]: stock.pe }), {})
    },
    {
      metric: 'Dividend Yield',
      ...comparisonStocks.reduce((acc, stock) => ({ ...acc, [stock.symbol]: (stock.dividend / stock.price * 100) }), {})
    },
    {
      metric: 'Price vs 52W High',
      ...comparisonStocks.reduce((acc, stock) => ({ ...acc, [stock.symbol]: (stock.price / stock.fiftyTwoWeekHigh * 100) }), {})
    },
    {
      metric: 'YTD Performance',
      ...comparisonStocks.reduce((acc, stock) => ({ ...acc, [stock.symbol]: stock.changePercent * 2 }), {})
    },
  ];

  const handleStockSelection = (symbol: string) => {
    if (selectedStocks.includes(symbol)) {
      setSelectedStocks(selectedStocks.filter(s => s !== symbol));
    } else if (selectedStocks.length < 4) {
      setSelectedStocks([...selectedStocks, symbol]);
    }
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1000000000000) return `$${(value / 1000000000000).toFixed(2)}T`;
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    return `$${(value / 1000000).toFixed(2)}M`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Research</h1>
        <p className="text-gray-600 mt-1">Screen stocks, compare investments, and analyze market opportunities</p>
      </div>

      {/* Market Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
          <CardDescription>Major indices performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {marketIndices.map(index => (
              <div key={index.name} className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">{index.name}</div>
                <div className="text-2xl font-bold mb-1">{index.value.toLocaleString()}</div>
                <div className={`text-sm font-medium ${getReturnColor(index.change)}`}>
                  {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({formatPercent(index.changePercent)})
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stock Screener */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Stock Screener</CardTitle>
          <CardDescription>Filter stocks by your criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Symbol or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sectors</option>
                {uniqueSectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Market Cap (B)
              </label>
              <input
                type="number"
                value={minMarketCap}
                onChange={(e) => setMinMarketCap(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max P/E Ratio
              </label>
              <input
                type="number"
                value={maxPE}
                onChange={(e) => setMaxPE(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Dividend (%)
              </label>
              <input
                type="number"
                value={minDividend}
                onChange={(e) => setMinDividend(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">
                    <input type="checkbox" className="mr-2" disabled />
                    Select
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Symbol</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Sector</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Change</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Market Cap</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">P/E</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Div Yield</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.slice(0, 10).map(stock => {
                  const divYield = (stock.dividend / stock.price * 100).toFixed(2);
                  return (
                    <tr key={stock.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedStocks.includes(stock.symbol)}
                          onChange={() => handleStockSelection(stock.symbol)}
                          disabled={!selectedStocks.includes(stock.symbol) && selectedStocks.length >= 4}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-600">{stock.symbol}</td>
                      <td className="py-3 px-4 text-sm">{stock.name}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">{stock.sector}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(stock.price)}</td>
                      <td className={`py-3 px-4 text-right text-sm font-medium ${getReturnColor(stock.change)}`}>
                        {formatPercent(stock.changePercent)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm">{formatMarketCap(stock.marketCap)}</td>
                      <td className="py-3 px-4 text-right text-sm">{stock.pe.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right text-sm">{divYield}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredStocks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No stocks match your screening criteria. Try adjusting your filters.
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            Showing {Math.min(filteredStocks.length, 10)} of {filteredStocks.length} stocks
            {selectedStocks.length > 0 && ` • ${selectedStocks.length} selected for comparison`}
          </div>
        </CardContent>
      </Card>

      {/* Stock Comparison */}
      {selectedStocks.length >= 2 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Stock Comparison</CardTitle>
            <CardDescription>Compare selected stocks side-by-side (select up to 4)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Comparison Table */}
              <div>
                <h4 className="font-semibold mb-4">Key Metrics</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold text-gray-600">Metric</th>
                        {comparisonStocks.map(stock => (
                          <th key={stock.symbol} className="text-right py-2 font-semibold text-gray-600">
                            {stock.symbol}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-gray-700">Price</td>
                        {comparisonStocks.map(stock => (
                          <td key={stock.symbol} className="text-right py-2 font-medium">
                            {formatCurrency(stock.price)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-gray-700">Change</td>
                        {comparisonStocks.map(stock => (
                          <td key={stock.symbol} className={`text-right py-2 font-medium ${getReturnColor(stock.change)}`}>
                            {formatPercent(stock.changePercent)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-gray-700">Market Cap</td>
                        {comparisonStocks.map(stock => (
                          <td key={stock.symbol} className="text-right py-2">
                            {formatMarketCap(stock.marketCap)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-gray-700">P/E Ratio</td>
                        {comparisonStocks.map(stock => (
                          <td key={stock.symbol} className="text-right py-2">
                            {stock.pe.toFixed(1)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-gray-700">Dividend Yield</td>
                        {comparisonStocks.map(stock => (
                          <td key={stock.symbol} className="text-right py-2">
                            {(stock.dividend / stock.price * 100).toFixed(2)}%
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-gray-700">52W High</td>
                        {comparisonStocks.map(stock => (
                          <td key={stock.symbol} className="text-right py-2">
                            {formatCurrency(stock.fiftyTwoWeekHigh)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-700">52W Low</td>
                        {comparisonStocks.map(stock => (
                          <td key={stock.symbol} className="text-right py-2">
                            {formatCurrency(stock.fiftyTwoWeekLow)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Performance Chart */}
              <div>
                <h4 className="font-semibold mb-4">Performance Comparison</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonStocks}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="symbol" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatPercent(value)} />
                    <Bar dataKey="changePercent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sector Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Sector Performance</CardTitle>
          <CardDescription>Average returns by sector</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={uniqueSectors.map(sector => {
                const sectorStocks = mockStockData.filter(s => s.sector === sector);
                const avgChange = sectorStocks.reduce((sum, s) => sum + s.changePercent, 0) / sectorStocks.length;
                return { sector, avgChange };
              })}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sector" angle={-45} textAnchor="end" height={100} fontSize={12} />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
              <Bar dataKey="avgChange" radius={[4, 4, 0, 0]}>
                {uniqueSectors.map((_, index) => {
                  const sectorStocks = mockStockData.filter(s => s.sector === uniqueSectors[index]);
                  const avgChange = sectorStocks.reduce((sum, s) => sum + s.changePercent, 0) / sectorStocks.length;
                  return <Cell key={`cell-${index}`} fill={avgChange > 0 ? '#10b981' : '#ef4444'} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}