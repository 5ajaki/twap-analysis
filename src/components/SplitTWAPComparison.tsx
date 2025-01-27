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
  Scatter,
} from "recharts";

interface TWAPChartProps {
  data: ChartData;
  period: number;
  minimumSafe: number;
  annualVolatility: number;
}

interface ChartDataPoint {
  month: number;
  balanceBase: number;
  balanceUp: number;
  balanceDown: number;
  volatilityRange: number[];
  crossover: number | null;
}

interface ChartData extends Array<ChartDataPoint> {
  crossoverMonth?: number | null;
}

const TWAPChart: React.FC<TWAPChartProps> = ({
  data,
  period,
  minimumSafe,
  annualVolatility,
}) => {
  return (
    <div className="w-full mb-8">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "0.5rem",
        }}
      >
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            margin: 0,
          }}
        >
          {period}-Month TWAP Analysis
        </h3>
        <div
          style={{
            flex: 1,
            padding: "0.5rem 0.75rem",
            backgroundColor: "#fefce8",
            borderRadius: "0.375rem",
            border: "1px solid #fef08a",
            fontSize: "0.875rem",
            boxShadow: "0 1px 2px rgba(254, 240, 138, 0.1)",
          }}
        >
          <p style={{ margin: 0, fontWeight: "500", color: "#854d0e" }}>
            🔍 Could cross below $2M safety threshold at{" "}
            <span style={{ fontWeight: "bold", color: "#1a1a1a" }}>
              {data.crossoverMonth
                ? `month ${data.crossoverMonth.toFixed(1)}`
                : "no crossing"}
            </span>{" "}
            using selected volatility of {(annualVolatility * 100).toFixed(1)}%
          </p>
        </div>
      </div>
      <div style={{ height: "18rem" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            style={{ isolation: "isolate" }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickFormatter={(value: number) =>
                `Month ${
                  Number.isInteger(value) ? value.toString() : value.toFixed(1)
                }`
              }
              ticks={Array.from({ length: 13 }, (_, i) => i)}
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
              labelFormatter={(value: number) => `Month ${value.toFixed(1)}`}
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

            <ReferenceLine
              y={minimumSafe}
              stroke="#4b5563"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: "Minimum Safe Balance",
                position: "right",
                style: { fill: "#4b5563" },
              }}
            />

            <Scatter
              name=""
              dataKey="crossover"
              fill="#ef4444"
              shape="circle"
              legendType="none"
              r={6}
              isAnimationActive={false}
            />

            {/* Add a second scatter to make the dot more visible */}
            <Scatter
              name=""
              dataKey="crossover"
              fill="#ef4444"
              shape="circle"
              legendType="none"
              r={3}
              isAnimationActive={false}
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
  const BASE_ANNUAL_VOL = 0.45;

  // State for volatility slider
  const [annualVolatility, setAnnualVolatility] =
    React.useState(BASE_ANNUAL_VOL);
  const MONTHLY_VOL = annualVolatility / Math.sqrt(12);

  const generateData = (period: number): ChartData => {
    const data: ChartData = [];
    let crossoverPoint: number | null = null;
    let lastBalance: number | null = null;

    for (let month = 0; month <= 12; month += 0.05) {
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
      const lowerBound = baseBalance - volatilityAmount;

      // Check if we cross minimum safe balance
      if (
        lastBalance !== null &&
        lastBalance >= MINIMUM_SAFE &&
        lowerBound < MINIMUM_SAFE &&
        crossoverPoint === null
      ) {
        // Only capture first crossing
        // Linear interpolation to find exact crossing point
        const ratio = (MINIMUM_SAFE - lastBalance) / (lowerBound - lastBalance);
        crossoverPoint = month - 0.05 + ratio * 0.05;
        console.log(`Period ${period}: Crossing details:`, {
          month,
          lastBalance,
          lowerBound,
          ratio,
          crossoverPoint,
          MINIMUM_SAFE,
        });
      }
      lastBalance = lowerBound;

      // Push data points at 0.1 month increments instead of just whole months
      if (Math.abs(month * 10 - Math.round(month * 10)) < 0.01) {
        const dataPoint = {
          month: Math.round(month * 10) / 10, // Round to 1 decimal place
          balanceBase: baseBalance,
          balanceUp: baseBalance + volatilityAmount,
          balanceDown: lowerBound,
          volatilityRange: [lowerBound, baseBalance + volatilityAmount],
          crossover:
            crossoverPoint !== null && Math.abs(month - crossoverPoint) < 0.1
              ? MINIMUM_SAFE
              : null,
        };
        console.log(`Period ${period}: Data point at month ${month}:`, {
          month,
          crossoverPoint: crossoverPoint,
          showingDot: dataPoint.crossover !== null,
        });
        data.push(dataPoint);
      }
    }

    // Store crossover point for key insights
    data.crossoverMonth = crossoverPoint;

    return data;
  };

  // Memoize the data calculations
  const data3m = React.useMemo(() => generateData(3), [annualVolatility]);
  const data6m = React.useMemo(() => generateData(6), [annualVolatility]);
  const data9m = React.useMemo(() => generateData(9), [annualVolatility]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        padding: "2rem",
        margin: "2rem auto",
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

      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            width: "50%",
            padding: "1.5rem",
            backgroundColor: "white",
            borderRadius: "0.5rem",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            background: "linear-gradient(to bottom, #ffffff, #f9fafb)",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            <label
              htmlFor="volatility1"
              style={{
                minWidth: "8rem",
                fontWeight: "bold",
                color: "#1a1a1a",
                backgroundColor: "#e5e7eb",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              }}
            >
              Annual Volatility (adjust slider to change graphs):
            </label>
            <span
              style={{
                minWidth: "4rem",
                fontWeight: "bold",
                color: "#1a1a1a",
              }}
            >
              {(annualVolatility * 100).toFixed(1)}%
            </span>
          </div>
          <input
            id="volatility1"
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={annualVolatility}
            onChange={(e) => setAnnualVolatility(parseFloat(e.target.value))}
            style={{
              width: "100%",
              height: "8px",
              WebkitAppearance: "none",
              background: "linear-gradient(to right, #4f46e5, #818cf8)",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      <TWAPChart
        data={data3m}
        period={3}
        minimumSafe={MINIMUM_SAFE}
        annualVolatility={annualVolatility}
      />
      <TWAPChart
        data={data6m}
        period={6}
        minimumSafe={MINIMUM_SAFE}
        annualVolatility={annualVolatility}
      />
      <TWAPChart
        data={data9m}
        period={9}
        minimumSafe={MINIMUM_SAFE}
        annualVolatility={annualVolatility}
      />

      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            width: "50%",
            padding: "1.5rem",
            backgroundColor: "white",
            borderRadius: "0.5rem",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            background: "linear-gradient(to bottom, #ffffff, #f9fafb)",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            <label
              htmlFor="volatility2"
              style={{
                minWidth: "8rem",
                fontWeight: "bold",
                color: "#1a1a1a",
                backgroundColor: "#e5e7eb",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              }}
            >
              Annual Volatility (adjust slider to change graphs):
            </label>
            <span
              style={{
                minWidth: "4rem",
                fontWeight: "bold",
                color: "#1a1a1a",
              }}
            >
              {(annualVolatility * 100).toFixed(1)}%
            </span>
          </div>
          <input
            id="volatility2"
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={annualVolatility}
            onChange={(e) => setAnnualVolatility(parseFloat(e.target.value))}
            style={{
              width: "100%",
              height: "8px",
              WebkitAppearance: "none",
              background: "linear-gradient(to right, #4f46e5, #818cf8)",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          backgroundColor: "#F9FAFB",
          borderRadius: "0.25rem",
        }}
      >
        <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
          Key Insights (based on selected vol of{" "}
          {(annualVolatility * 100).toFixed(1)}%):
        </h3>
        <ul style={{ listStyleType: "disc", paddingLeft: "1rem" }}>
          <li style={{ marginBottom: "0.5rem" }}>
            3-month TWAP: Lower bound crosses minimum safe balance ($2M) at
            month {data3m.crossoverMonth?.toFixed(1) || "N/A"}
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            6-month TWAP: Lower bound crosses minimum safe balance at month{" "}
            {data6m.crossoverMonth?.toFixed(1) || "N/A"}
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            9-month TWAP: Lower bound crosses minimum safe balance at month{" "}
            {data9m.crossoverMonth?.toFixed(1) || "N/A"}
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
            Cone width calculation: Using {(annualVolatility * 100).toFixed(1)}%
            annualized ETH volatility (σ), at month t the **TWAP portion**
            varies by: ± (σ/√12) × √min(t, TWAP_period) = ±{" "}
            {(MONTHLY_VOL * 100).toFixed(1)}% × √min(t, TWAP_period) This
            volatility impacts only the ETH being sold via TWAP (not the stable
            USDC reserves).
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SplitTWAPComparison;
