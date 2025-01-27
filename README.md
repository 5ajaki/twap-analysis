# TWAP Analysis Viewer (For KPK Temp Check)

An interactive visualization tool for analyzing the different Time-Weighted Average Price (TWAP) strategies with different parameters and volatility scenarios.
The is specific to the ENS DAO temp check at this link (https://discuss.ens.domains/t/temp-check-convert-6-000-eth-to-usdc-for-dao-operating-expenses/20138/3)


### Hosted Here
:star: Visit [TWAP Analysis Viewer](https://5ajaki.github.io/twap-analysis/) to use the tool. :star:

## Features

- Interactive comparison of 3, 6, and 9-month TWAP strategies
- Real-time volatility adjustment using a slider (10% to 100%)\*
- Visual representation of uncertainty cones for each strategy\*\*
- Minimum safe balance threshold monitoring
- Crossing point detection and visualization
- Dynamic tooltips showing detailed balance information

## Usage Guide

1. **Adjusting Volatility**: Use the slider to set annual ETH price volatility (10% to 100%)

   - Changes are reflected immediately in all three graphs
   - Key insights update automatically with new crossing points

2. **Reading the Graphs**:

   - Solid line: Expected balance trajectory if ETH value doesnt change during TWAP
   - Shaded area: Cone of uncertainty (possible balance range created from volatility during TWAP
   - Dashed line: $2M minimum safe balance threshold
   - Red dot: Point where lower bound crosses minimum safe balance (this recalculates dynamically)

3. **Tooltips**: Hover over any point to see detailed values for:
   - High balance estimate
   - Expected balance
   - Low balance estimate


## Technical Details

- Initial ETH: 6,000
- Immediate ETH sale: 1,000
- ETH Price: $3,200 used for day 0 starting price
- Monthly Spend: $1.46M
- Minimum Safe Balance: $2M
- Volatility calculation: Using monthly volatility (annual/√12) with time scaling

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Implementation Notes

- Uses React with TypeScript
- Recharts 
- Real-time calculations for uncertainty cones
- Responsive 

## Built With

- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Recharts](https://recharts.org/) - A composable charting library built on React components

## Notes

\* Volatility calculation: Using monthly volatility (annual/√12) × √min(t, TWAP_period). This volatility impacts only the ETH being sold via TWAP (not the stable USDC reserves).

\*\* The cone of uncertainty shows potential balance ranges based on ETH price volatility (shaded area).

## License

MIT License - feel free to use this code for your own projects.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
