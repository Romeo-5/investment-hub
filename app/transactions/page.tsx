'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card';
import { generateMockPortfolioData } from '../../lib/mockData';
import { PortfolioData, Transaction } from '../../types/portfolio';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

type TransactionType = 'all' | 'buy' | 'sell' | 'dividend';

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];

export default function TransactionsPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [filterType, setFilterType] = useState<TransactionType>('all');
  const [filterSymbol, setFilterSymbol] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

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

  const { transactions } = portfolioData;

  // Get unique symbols
  const uniqueSymbols = Array.from(new Set(transactions.map(t => t.symbol))).sort();

  // Filter transactions
  let filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesSymbol = filterSymbol === 'all' || transaction.symbol === filterSymbol;
    const matchesSearch = searchQuery === '' || 
      transaction.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const transactionDate = new Date(transaction.date);
    const matchesDateFrom = dateFrom === '' || transactionDate >= new Date(dateFrom);
    const matchesDateTo = dateTo === '' || transactionDate <= new Date(dateTo);
    
    return matchesType && matchesSymbol && matchesSearch && matchesDateFrom && matchesDateTo;
  });

  // Calculate statistics
  const totalBuys = transactions.filter(t => t.type === 'buy').length;
  const totalSells = transactions.filter(t => t.type === 'sell').length;
  const totalDividends = transactions.filter(t => t.type === 'dividend').length;
  
  const totalBuyAmount = transactions
    .filter(t => t.type === 'buy')
    .reduce((sum, t) => sum + t.total, 0);
  
  const totalSellAmount = transactions
    .filter(t => t.type === 'sell')
    .reduce((sum, t) => sum + t.total, 0);
  
  const totalDividendAmount = transactions
    .filter(t => t.type === 'dividend')
    .reduce((sum, t) => sum + t.total, 0);
  
  const totalFees = transactions.reduce((sum, t) => sum + t.fees, 0);

  // Transaction type breakdown for pie chart
  const transactionTypeData = [
    { name: 'Buys', value: totalBuys, amount: totalBuyAmount },
    { name: 'Sells', value: totalSells, amount: totalSellAmount },
    { name: 'Dividends', value: totalDividends, amount: totalDividendAmount },
  ].filter(item => item.value > 0);

  // Monthly transaction volume
  const monthlyData = transactions.reduce((acc, transaction) => {
    const month = transaction.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (!acc[month]) {
      acc[month] = { month, buys: 0, sells: 0, dividends: 0 };
    }
    if (transaction.type === 'buy') acc[month].buys += transaction.total;
    if (transaction.type === 'sell') acc[month].sells += transaction.total;
    if (transaction.type === 'dividend') acc[month].dividends += transaction.total;
    return acc;
  }, {} as Record<string, { month: string; buys: number; sells: number; dividends: number }>);

  const monthlyChartData = Object.values(monthlyData)
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-12); // Last 12 months

  // Most traded stocks
  const symbolVolume = transactions.reduce((acc, t) => {
    if (!acc[t.symbol]) acc[t.symbol] = 0;
    acc[t.symbol] += t.total;
    return acc;
  }, {} as Record<string, number>);

  const topTradedStocks = Object.entries(symbolVolume)
    .map(([symbol, total]) => ({ symbol, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Tax reporting - calculate realized gains/losses
  const yearTransactions = transactions.filter(
    t => t.date.getFullYear() === currentYear
  );

  const yearSells = yearTransactions.filter(t => t.type === 'sell');
  const totalRealizedGains = yearSells.reduce((sum, t) => {
    // Mock calculation: assume 20% gain on sells
    const gain = t.total * 0.2;
    return sum + gain;
  }, 0);

  const handleExport = () => {
    // Create CSV content
    const headers = ['Date', 'Type', 'Symbol', 'Quantity', 'Price', 'Total', 'Fees'];
    const rows = filteredTransactions.map(t => [
      formatDate(t.date),
      t.type.toUpperCase(),
      t.symbol,
      t.quantity,
      t.price.toFixed(2),
      t.total.toFixed(2),
      t.fees.toFixed(2),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'buy': return 'text-green-600 bg-green-50';
      case 'sell': return 'text-red-600 bg-red-50';
      case 'dividend': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Complete transaction history and analysis</p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          📥 Export to CSV
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Transactions</CardDescription>
            <CardTitle className="text-3xl">{transactions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {filteredTransactions.length} shown
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Invested</CardDescription>
            <CardTitle className="text-3xl text-green-600">{formatCurrency(totalBuyAmount)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {totalBuys} buy transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Proceeds</CardDescription>
            <CardTitle className="text-3xl text-red-600">{formatCurrency(totalSellAmount)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {totalSells} sell transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Dividend Income</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{formatCurrency(totalDividendAmount)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {totalDividends} dividend payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Symbol or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as TransactionType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
                <option value="dividend">Dividend</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Symbol</label>
              <select
                value={filterSymbol}
                onChange={(e) => setFilterSymbol(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Symbols</option>
                {uniqueSymbols.map(symbol => (
                  <option key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                  setFilterSymbol('all');
                  setDateFrom('');
                  setDateTo('');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Breakdown</CardTitle>
            <CardDescription>By type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transactionTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {transactionTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [value, `${props.payload.name}: ${formatCurrency(props.payload.amount)}`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Traded Stocks</CardTitle>
            <CardDescription>By total transaction volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTradedStocks.map((stock, index) => (
                <div key={stock.symbol}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{index + 1}. {stock.symbol}</span>
                    <span className="text-sm font-bold">{formatCurrency(stock.total)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(stock.total / topTradedStocks[0].total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Activity Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Monthly Transaction Volume</CardTitle>
          <CardDescription>Last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="buys" fill="#10b981" name="Buys" />
                <Bar dataKey="sells" fill="#ef4444" name="Sells" />
                <Bar dataKey="dividends" fill="#3b82f6" name="Dividends" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tax Reporting Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tax Reporting - Year {currentYear}</CardTitle>
          <CardDescription>Preliminary tax information (consult with tax professional)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium mb-1">Total Sells</div>
              <div className="text-2xl font-bold text-blue-900">{yearSells.length}</div>
              <div className="text-sm text-blue-600 mt-1">
                {formatCurrency(yearSells.reduce((sum, t) => sum + t.total, 0))}
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium mb-1">Est. Realized Gains</div>
              <div className="text-2xl font-bold text-green-900">{formatCurrency(totalRealizedGains)}</div>
              <div className="text-xs text-green-600 mt-1">Mock calculation - 20% of sell value</div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 font-medium mb-1">Dividend Income</div>
              <div className="text-2xl font-bold text-purple-900">
                {formatCurrency(yearTransactions.filter(t => t.type === 'dividend').reduce((sum, t) => sum + t.total, 0))}
              </div>
              <div className="text-xs text-purple-600 mt-1">Reportable income</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Disclaimer:</strong> This is a simplified tax summary for informational purposes only. 
              Please consult with a qualified tax professional for accurate tax reporting and preparation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History ({filteredTransactions.length})</CardTitle>
          <CardDescription>Complete record of all transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Symbol</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Quantity</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Total</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Fees</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.slice(0, 50).map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{formatDate(transaction.date)}</td>
                    <td className="py-3 px-4 text-xs text-gray-500 font-mono">{transaction.id}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getTransactionTypeColor(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-600">{transaction.symbol}</td>
                    <td className="py-3 px-4 text-right text-sm">{transaction.quantity}</td>
                    <td className="py-3 px-4 text-right text-sm">{formatCurrency(transaction.price)}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold">{formatCurrency(transaction.total)}</td>
                    <td className="py-3 px-4 text-right text-sm text-gray-600">{formatCurrency(transaction.fees)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td colSpan={6} className="py-3 px-4 font-bold text-sm">
                    Total ({filteredTransactions.length} transactions)
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-sm">
                    {formatCurrency(filteredTransactions.reduce((sum, t) => sum + t.total, 0))}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-sm">
                    {formatCurrency(filteredTransactions.reduce((sum, t) => sum + t.fees, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No transactions match your filters. Try adjusting your search criteria.
            </div>
          )}

          {filteredTransactions.length > 50 && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              Showing first 50 of {filteredTransactions.length} transactions. Use filters to narrow results or export all to CSV.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}