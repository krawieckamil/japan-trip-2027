import { useState } from "react";

import { CostBreakdown } from "./components/CostBreakdown";
import { CostOverview } from "./components/CostOverview";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Journey } from "./components/Journey";
import { Nav } from "./components/Nav";
import { RouteIndex } from "./components/RouteIndex";
import { TRIP } from "./data/trip";
import { useActiveCity } from "./hooks/useActiveCity";

function App() {
  const [mult, setMult] = useState(1);
  const activeCity = useActiveCity(TRIP.cities);

  return (
    <div className="relative z-[2]">
      <Nav trip={TRIP} activeCity={activeCity} />
      <Hero />

      <main>
        <RouteIndex trip={TRIP} />
        <CostOverview trip={TRIP} mult={mult} onMultChange={setMult} />
        <Journey trip={TRIP} mult={mult} />
        <CostBreakdown trip={TRIP} />
      </main>

      <Footer />
    </div>
  );
}

export default App;
