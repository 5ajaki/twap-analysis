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
  ReferenceLine,
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
        Critical price decline would require: {criticalDecline}% (hits minimum
        safe balance at month {criticalMonth})
      </div>
      <div style={{ height: "24rem" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            style={{ isolation: "isolate" }}
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
              formatter={(value: any, name: string) => {
                if (name === "Cone of Uncertainty") {
                  const color =
                    period === 3
                      ? "#16a34a"
                      : period === 6
                      ? "#2563eb"
                      : "#dc2626";
                  return value === null
                    ? ["-", name]
                    : [
                        <span style={{ color: "black" }}>
                          High:{" "}
                          <span style={{ color }}>
                            ${(value[1] / 1000000).toFixed(2)}M
                          </span>
                          <br />
                          <strong>Expected:</strong>{" "}
                          <span style={{ color }}>
                            <strong>
                              $
                              {((value[1] + value[0]) / 2 / 1000000).toFixed(2)}
                              M
                            </strong>
                          </span>
                          <br />
                          Low:{" "}
                          <span style={{ color }}>
                            ${(value[0] / 1000000).toFixed(2)}M
                          </span>
                        </span>,
                        "",
                      ];
                }
                return ["", ""];
              }}
              labelFormatter={(value: number) => `Month ${value}`}
              separator=""
              contentStyle={{ whiteSpace: "pre-line" }}
            />
            <Legend />

            <Area
              name="Cone of Uncertainty"
              dataKey="volatilityRange"
              stroke="none"
              fill={
                period === 3 ? "#86efac" : period === 6 ? "#93c5fd" : "#fca5a5"
              }
              fillOpacity={0.2}
            />

            <Line
              name="Expected Balance"
              type="monotone"
              dataKey="balanceBase"
              stroke={
                period === 3 ? "#16a34a" : period === 6 ? "#2563eb" : "#dc2626"
              }
              strokeWidth={2}
              dot={false}
            />

            <ReferenceLine y={0} stroke="#000" strokeOpacity={0.1} />

            <Line
              name="Critical Decline Scenario"
              type="monotone"
              dataKey="balanceCritical"
              stroke={
                period === 3 ? "#15803d" : period === 6 ? "#1e40af" : "#991b1b"
              }
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
    3: { decline: 75.0, month: 2.8 },
    6: { decline: 53.0, month: 5.9 },
    9: { decline: 26.0, month: 8.5 },
  };

  const generateData = (
    period: number,
    criticalPoint: { decline: number; month: number }
  ) => {
    const data = [];

    for (let month = 0; month <= 12; month++) {
      const baseUSDC = IMMEDIATE_ETH * ETH_PRICE;
      const spent = MONTHLY_SPEND * month;

      // Calculate TWAP amounts
      const twapProgress = Math.min(month / period, 1);
      const remainingETH = INITIAL_ETH - IMMEDIATE_ETH;

      // Base case
      const twapBase = remainingETH * ETH_PRICE * twapProgress;
      const baseBalance = baseUSDC + twapBase - spent;

      // Critical decline case - only calculate if before critical month
      const criticalPrice = ETH_PRICE * (1 - criticalPoint.decline / 100);
      const twapCritical = remainingETH * criticalPrice * twapProgress;

      // Uncertainty bounds
      const volatilityAtTime = MONTHLY_VOL * Math.sqrt(Math.min(month, period));
      const volatilityAmount = twapBase * volatilityAtTime;

      data.push({
        month,
        balanceBase: baseBalance,
        balanceCritical:
          month <= criticalPoint.month ? baseUSDC + twapCritical - spent : null,
        balanceUp: baseBalance + volatilityAmount,
        balanceDown: baseBalance - volatilityAmount,
        minSafe: MINIMUM_SAFE,
        volatilityRange: [
          baseBalance - volatilityAmount,
          baseBalance + volatilityAmount,
        ],
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
        data={generateData(3, CRITICAL_POINTS[3])}
        period={3}
        criticalDecline={CRITICAL_POINTS[3].decline}
        criticalMonth={CRITICAL_POINTS[3].month.toFixed(1)}
      />

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
            3-month TWAP can sustain a 75.0% absolute price decline (from $3,200
            to $800) over the 3-month period while maintaining minimum safe
            balance
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            6-month TWAP can sustain a 53.0% absolute price decline (from $3,200
            to $1,504) over the 6-month period while maintaining minimum safe
            balance
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            9-month TWAP is more vulnerable to price declines, with a critical
            threshold of 26.0% (from $3,200 to $2,368) over the 9-month period
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            Critical decline lines stop when balance hits minimum safe level
            ($2M)
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            The cone of uncertainty shows potential balance ranges based on ETH
            price volatility (shaded area)
          </li>
          <li>
            Cone width calculation: Using 45% annualized volatility (σ), at
            month t the balance range is: Expected Balance ± (σ/√12) × √t =
            Expected Balance ± {(MONTHLY_VOL * 100).toFixed(1)}% × √t
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SplitTWAPComparison;
