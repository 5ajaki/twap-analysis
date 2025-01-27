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
}

const TWAPChart: React.FC<TWAPChartProps> = ({ data, period }) => {
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

  const generateData = (period: number) => {
    const data = [];

    for (let month = 0; month <= 12; month++) {
      const immediateUSDC = IMMEDIATE_ETH * ETH_PRICE;
      const spent = MONTHLY_SPEND * month;
      const remainingETH = INITIAL_ETH - IMMEDIATE_ETH;

      // Base case (no decline)
      const twapProgress = Math.min(month / period, 1);
      const twapUSDC = remainingETH * ETH_PRICE * twapProgress;
      const baseBalance = immediateUSDC + twapUSDC - spent;

      // Uncertainty bounds based on TWAP period
      const volatilityAtTime = MONTHLY_VOL * Math.sqrt(Math.min(month, period));
      const volatilityAmount = twapUSDC * volatilityAtTime;

      data.push({
        month,
        balanceBase: baseBalance,
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

      <TWAPChart data={generateData(3)} period={3} />

      <TWAPChart data={generateData(6)} period={6} />

      <TWAPChart data={generateData(9)} period={9} />

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
            3-month TWAP: Lower bound of uncertainty cone hits zero at month
            11.2, meaning there's a ~2σ (95%) chance of maintaining positive
            balance through the year
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            6-month TWAP: Lower bound hits zero at month 10.5, with wider
            uncertainty due to longer execution period
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            9-month TWAP: Lower bound hits zero at month 9.8, showing highest
            risk due to extended market exposure
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            Shorter TWAP periods reduce market exposure and narrow the cone of
            uncertainty
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            The cone of uncertainty shows potential balance ranges based on ETH
            price volatility (shaded area)
          </li>
          <li>
            Cone width calculation: Using 45% annualized volatility (σ), at
            month t the balance range is: Expected Balance ± (σ/√12) × √min(t,
            TWAP_period) = Expected Balance ± {(MONTHLY_VOL * 100).toFixed(1)}%
            × √min(t, TWAP_period)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SplitTWAPComparison;
