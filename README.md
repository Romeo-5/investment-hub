# Investment Hub

A comprehensive financial investment analytics platform built with Next.js, TypeScript, and advanced data analysis capabilities.

## Features

- **Dashboard**: Portfolio overview with real-time performance metrics and visualizations
- **Analytics**: Deep risk analysis including Sharpe ratio, volatility, max drawdown, and portfolio optimization insights
- **Holdings**: Detailed view of all positions with performance tracking
- **Research**: Stock screening and analysis tools (coming soon)
- **Transactions**: Complete transaction history and tax reporting (coming soon)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Charts**: Recharts for interactive data visualizations
- **Backend**: FastAPI (Python) for analytics engine (in development)
- **Data**: Charles Schwab API integration (in progress)

## Current Status

🚧 **MVP Development Mode** - Currently using mock data for development while awaiting Schwab API approval.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Romeo-5/investment-hub.git
cd investment-hub
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
investment-hub/
├── app/                  # Next.js app directory
│   ├── dashboard/        # Portfolio dashboard
│   ├── analytics/        # Risk metrics and analysis
│   ├── holdings/         # Position details
│   ├── research/         # Stock research tools
│   └── transactions/     # Transaction history
├── components/           # Reusable React components
│   ├── ui/              # UI primitives
│   └── charts/          # Chart components
├── lib/                 # Utility functions and logic
│   ├── analytics/       # Analytics calculations
│   ├── mockData.ts      # Mock data generator
│   └── utils.ts         # Helper functions
├── types/               # TypeScript type definitions
└── public/              # Static assets
```

## Analytics Features

### Current Metrics
- Total portfolio value and returns
- Daily, monthly, and YTD performance
- Sharpe ratio (risk-adjusted returns)
- Portfolio volatility (annualized)
- Maximum drawdown
- Portfolio beta vs S&P 500
- Sector and asset allocation
- Position-level performance

### Coming Soon
- Portfolio optimization (efficient frontier)
- Correlation matrices
- Factor analysis
- ML-powered predictions
- Tax-loss harvesting opportunities
- Custom benchmark comparisons

## Roadmap

- [x] Project setup and structure
- [x] Mock data generation
- [x] Dashboard with key metrics
- [x] Analytics page with risk metrics
- [x] Holdings detailed view
- [x] Research/screening tools
- [x] Transaction history
- [ ] Charles Schwab API integration
- [ ] Python FastAPI backend
- [ ] ML models for predictions
- [ ] Real-time data updates
- [ ] Mobile responsive design
- [ ] Export and reporting features

## License

MIT

## Author

Romeo - [GitHub](https://github.com/Romeo-5)