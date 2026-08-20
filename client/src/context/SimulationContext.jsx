import { createContext, useContext, useState } from "react";

const SimulationContext = createContext();

export function SimulationProvider({ children }) {
  const [mode, setMode] = useState("demo"); // demo | live

  const toggleMode = () => {
    setMode((prev) => (prev === "demo" ? "live" : "demo"));
  };

  return (
    <SimulationContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulationMode() {
  return useContext(SimulationContext);
}
