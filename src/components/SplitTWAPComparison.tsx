import React from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TWAPChartProps {
  data: any[];
  period: number;
  criticalDecline: number;
  criticalMonth: string;
}

const TWAPChart: React.FC<TWAPChartProps> = ({
  data,
  period,
  criticalDecline,
  criticalMonth,
}) => {
  return (
    <div className="w-full mb-8">
      <h3
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          marginBottom: "0.5rem",
        }}
      >
        {period}-Month TWAP Analysis
      </h3>
      <div
        style={{ fontSize: "0.875rem", color: "#4B5563", marginBottom: "1rem" }}
      >
        Critical Price Decline: {criticalDecline}% (hits minimum safe balance at
        month {criticalMonth})
      </div>
      <div style={{ height: "24rem" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickFormatter={(value: number) => `Month ${value}`}
            />
            <YAxis
              tickFormatter={(value: number) =>
                `$${(value / 1000000).toFixed(1)}M`
              }
            />
            <Tooltip
              formatter={(value: number) => [
                `$${(value / 1000000).toFixed(2)}M`,
                null,
              ]}
              labelFormatter={(value: number) => `Month ${value}`}
            />
            <Legend />

            <Area
              name="Price Range"
              dataKey="balanceUp"
              stroke="none"
              fill={period === 6 ? "#93c5fd" : "#fca5a5"}
              fillOpacity={0.2}
            />
            <Area
              dataKey="balanceDown"
              stroke="none"
              fill={period === 6 ? "#93c5fd" : "#fca5a5"}
              fillOpacity={0.2}
            />

            <Line
              name="Expected Balance"
              type="monotone"
              dataKey="balanceBase"
              stroke={period === 6 ? "#2563eb" : "#dc2626"}
              strokeWidth={2}
            />

            <Line
              name="Critical Decline Scenario"
              type="monotone"
              dataKey="balanceCritical"
              stroke={period === 6 ? "#1e40af" : "#991b1b"}
              strokeWidth={2}
              strokeDasharray="5 5"
            />

            <Line
              name="Minimum Safe Balance"
              type="monotone"
              dataKey="minSafe"
              stroke="#4b5563"
              strokeWidth={2}
              strokeDasharray="3 3"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const SplitTWAPComparison: React.FC = () => {
  // Constants
  const MONTHLY_SPEND = 17500000 / 12;
  const MINIMUM_SAFE = 2000000;
  const INITIAL_ETH = 6000;
  const IMMEDIATE_ETH = 1000;
  const ETH_PRICE = 3200;
  const MONTHLY_VOL = 0.45 / Math.sqrt(12);

  // Critical points
  const CRITICAL_POINTS = {
    6: { decline: 53.0, month: 5.9 },
    9: { decline: 26.0, month: 8.5 },
  };

  const generateData = (
    period: number,
    criticalPoint: { decline: number; month: number }
  ) => {
    const data = [];

    for (let month = 0; month <= period + 3; month++) {
      const baseUSDC = IMMEDIATE_ETH * ETH_PRICE;
      const spent = MONTHLY_SPEND * month;

      // Calculate TWAP amounts
      const twapProgress = Math.min(month / period, 1);
      const remainingETH = INITIAL_ETH - IMMEDIATE_ETH;

      // Base case
      const twapBase = remainingETH * ETH_PRICE * twapProgress;

      // Critical decline case - only calculate if before critical month
      const criticalPrice = ETH_PRICE * (1 - criticalPoint.decline / 100);
      const twapCritical = remainingETH * criticalPrice * twapProgress;

      // Uncertainty bounds
      const twapUp = twapBase * (1 + MONTHLY_VOL * Math.sqrt(month));
      const twapDown = twapBase * (1 - MONTHLY_VOL * Math.sqrt(month));

      data.push({
        month,
        balanceBase: baseUSDC + twapBase - spent,
        balanceCritical:
          month <= criticalPoint.month ? baseUSDC + twapCritical - spent : null,
        balanceUp: baseUSDC + twapUp - spent,
        balanceDown: baseUSDC + twapDown - spent,
        minSafe: MINIMUM_SAFE,
      });
    }
    return data;
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "1rem",
        backgroundColor: "white",
        borderRadius: "0.5rem",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: "bold",
          marginBottom: "1rem",
        }}
      >
        TWAP Strategy Comparison
      </h2>

      <TWAPChart
        data={generateData(6, CRITICAL_POINTS[6])}
        period={6}
        criticalDecline={CRITICAL_POINTS[6].decline}
        criticalMonth={CRITICAL_POINTS[6].month.toFixed(1)}
      />

      <TWAPChart
        data={generateData(9, CRITICAL_POINTS[9])}
        period={9}
        criticalDecline={CRITICAL_POINTS[9].decline}
        criticalMonth={CRITICAL_POINTS[9].month.toFixed(1)}
      />

      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          backgroundColor: "#F9FAFB",
          borderRadius: "0.25rem",
        }}
      >
        <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
          Key Insights:
        </h3>
        <ul style={{ listStyleType: "disc", paddingLeft: "1rem" }}>
          <li style={{ marginBottom: "0.5rem" }}>
            6-month TWAP can sustain a steeper price decline (53.0%) while
            maintaining minimum safe balance
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            9-month TWAP is more vulnerable to price declines, with a critical
            threshold of 26.0%
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            Critical decline lines stop when balance hits minimum safe level
            ($2M)
          </li>
          <li>
            Shaded areas show potential balance ranges based on historical ETH
            price volatility (±45% annualized)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SplitTWAPComparison;
