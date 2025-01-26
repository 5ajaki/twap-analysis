# TWAP Analysis Visualization

An interactive visualization tool for analyzing Time-Weighted Average Price (TWAP) strategies with different time horizons. The tool helps understand the balance trajectory and risk scenarios for various TWAP periods.

## Features

- Visualizes 3, 6, and 9-month TWAP strategies
- Shows expected balance trajectory
- Displays cone of uncertainty based on ETH price volatility
- Interactive tooltips showing:
  - High point of volatility cone
  - Expected balance (bold)
  - Low point of volatility cone
- Critical decline scenarios for each TWAP period
- Minimum safe balance reference line

## Technical Details

- Built with React and Recharts
- Uses 45% annualized volatility for uncertainty calculations
- Balance range at month t: Expected Balance ± (σ/√12) × √t
- Shows critical price decline thresholds:
  - 3-month TWAP: 75.0% decline ($3,200 to $800)
  - 6-month TWAP: 53.0% decline ($3,200 to $1,504)
  - 9-month TWAP: 26.0% decline ($3,200 to $2,368)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

## Usage

Hover over the charts to see detailed balance projections at each point in time. The shaded areas represent the cone of uncertainty, showing potential balance ranges based on ETH price volatility.

## Live Demo

Visit https://5ajaki.github.io/twap-analysis/

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Built with:

- Vite
- React
- TypeScript
- Recharts
