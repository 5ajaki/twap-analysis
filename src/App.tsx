import SplitTWAPComparison from "./components/SplitTWAPComparison";

function App() {
  return (
    <div
      style={{
        padding: "2rem",
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: "2rem", right: "2rem" }}>
        <a href="https://github.com/5ajaki/twap-analysis/blob/main/README.md">
          📄 README.md
        </a>
      </div>

      <SplitTWAPComparison />

      <div style={{ position: "absolute", bottom: "2rem", right: "2rem" }}>
        <a href="https://github.com/5ajaki/twap-analysis/blob/main/README.md">
          📄 README.md
        </a>
      </div>
    </div>
  );
}

export default App;
