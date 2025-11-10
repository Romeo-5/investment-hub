'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card';
import { generateMockPortfolioData } from '../../lib/mockData';
import { PortfolioData, Position } from '../../types/portfolio';
import { formatCurrency, formatPercent, getReturnColor } from '../../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type SortField = 'symbol' | 'marketValue' | 'gainLoss' | 'gainLossPercent' | 'quantity';
type SortDirection = 'asc' | 'desc';

export default function HoldingsPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [sortField, setSortField] = useState<SortField>('marketValue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterAssetType, setFilterAssetType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const { currentSnapshot, sectorAllocations } = portfolioData;

  // Get unique sectors and asset types for filters
  const uniqueSectors = Array.from(new Set(currentSnapshot.positions.map(p => p.sector)));
  const uniqueAssetTypes = Array.from(new Set(currentSnapshot.positions.map(p => p.assetType)));

  // Filter positions
  let filteredPositions = currentSnapshot.positions.filter(position => {
    const matchesSector = filterSector === 'all' || position.sector === filterSector;
    const matchesAssetType = filterAssetType === 'all' || position.assetType === filterAssetType;
    const matchesSearch = searchQuery === '' || 
      position.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      position.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSector && matchesAssetType && matchesSearch;
  });

  // Sort positions
  filteredPositions = [...filteredPositions].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const totalValue = currentSnapshot.totalValue;
  const totalGainLoss = currentSnapshot.positions.reduce((sum, p) => sum + p.gainLoss, 0);
  const totalCost = currentSnapshot.positions.reduce((sum, p) => sum + p.costBasis * p.quantity, 0);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Holdings</h1>
        <p className="text-gray-600 mt-1">Detailed view of all your positions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Positions</CardDescription>
            <CardTitle className="text-3xl">{currentSnapshot.positions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {filteredPositions.length} shown
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Market Value</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(totalValue)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Across all holdings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Cost Basis</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(totalCost)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Original investment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Gain/Loss</CardDescription>
            <CardTitle className={`text-3xl ${getReturnColor(totalGainLoss)}`}>
              {formatCurrency(totalGainLoss)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-sm font-medium ${getReturnColor(totalGainLoss)}`}>
              {formatPercent((totalGainLoss / totalCost) * 100)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Symbol or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sector
              </label>
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
                Asset Type
              </label>
              <select
                value={filterAssetType}
                onChange={(e) => setFilterAssetType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {uniqueAssetTypes.map(type => (
                  <option key={type} value={type}>{type.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterSector('all');
                  setFilterAssetType('all');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Positions ({filteredPositions.length})</CardTitle>
          <CardDescription>Click column headers to sort</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th 
                    className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('symbol')}
                  >
                    Symbol {getSortIcon('symbol')}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">
                    Sector
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">
                    Type
                  </th>
                  <th 
                    className="text-right py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('quantity')}
                  >
                    Shares {getSortIcon('quantity')}
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">
                    Avg Cost
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">
                    Current Price
                  </th>
                  <th 
                    className="text-right py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('marketValue')}
                  >
                    Market Value {getSortIcon('marketValue')}
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">
                    % of Portfolio
                  </th>
                  <th 
                    className="text-right py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('gainLoss')}
                  >
                    Gain/Loss ($) {getSortIcon('gainLoss')}
                  </th>
                  <th 
                    className="text-right py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('gainLossPercent')}
                  >
                    Gain/Loss (%) {getSortIcon('gainLossPercent')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPositions.map((position) => {
                  const portfolioPercent = (position.marketValue / totalValue) * 100;
                  return (
                    <tr 
                      key={position.symbol} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-bold text-blue-600">{position.symbol}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {position.name}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {position.sector}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs uppercase">
                          {position.assetType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-medium">
                        {position.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-sm">
                        {formatCurrency(position.costBasis)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm">
                        {formatCurrency(position.currentPrice)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-semibold">
                        {formatCurrency(position.marketValue)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-600">
                        {portfolioPercent.toFixed(2)}%
                      </td>
                      <td className={`py-3 px-4 text-right text-sm font-medium ${getReturnColor(position.gainLoss)}`}>
                        {formatCurrency(position.gainLoss)}
                      </td>
                      <td className={`py-3 px-4 text-right text-sm font-bold ${getReturnColor(position.gainLoss)}`}>
                        {formatPercent(position.gainLossPercent)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td colSpan={7} className="py-3 px-4 font-bold text-sm">
                    Total
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-sm">
                    {formatCurrency(filteredPositions.reduce((sum, p) => sum + p.marketValue, 0))}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-sm">
                    {((filteredPositions.reduce((sum, p) => sum + p.marketValue, 0) / totalValue) * 100).toFixed(2)}%
                  </td>
                  <td className={`py-3 px-4 text-right font-bold text-sm ${getReturnColor(filteredPositions.reduce((sum, p) => sum + p.gainLoss, 0))}`}>
                    {formatCurrency(filteredPositions.reduce((sum, p) => sum + p.gainLoss, 0))}
                  </td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {filteredPositions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No positions match your filters. Try adjusting your search criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Position Performance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Winners vs Losers</CardTitle>
            <CardDescription>Position performance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const winners = filteredPositions.filter(p => p.gainLoss > 0);
                const losers = filteredPositions.filter(p => p.gainLoss < 0);
                const winnersValue = winners.reduce((sum, p) => sum + p.gainLoss, 0);
                const losersValue = Math.abs(losers.reduce((sum, p) => sum + p.gainLoss, 0));
                
                return (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-green-700">
                          Winners ({winners.length})
                        </span>
                        <span className="text-sm font-bold text-green-700">
                          {formatCurrency(winnersValue)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full"
                          style={{ width: `${(winnersValue / (winnersValue + losersValue)) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-red-700">
                          Losers ({losers.length})
                        </span>
                        <span className="text-sm font-bold text-red-700">
                          -{formatCurrency(losersValue)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-red-500 h-3 rounded-full"
                          style={{ width: `${(losersValue / (winnersValue + losersValue)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Performers</CardTitle>
            <CardDescription>Best and worst by return %</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...filteredPositions]
                .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
                .slice(0, 5)
                .map(position => (
                  <div key={position.symbol} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm">{position.symbol}</span>
                      <span className="text-xs text-gray-500">{position.assetType.toUpperCase()}</span>
                    </div>
                    <span className={`text-sm font-bold ${getReturnColor(position.gainLoss)}`}>
                      {formatPercent(position.gainLossPercent)}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}