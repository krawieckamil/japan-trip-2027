import { useState } from "react";

import { TRIP } from "./data/trip";
import { useActiveCity } from "./hooks/useActiveCity";
import { CostBreakdown } from "./widgets/CostBreakdown";
import { CostOverview } from "./widgets/CostOverview";
import { Footer } from "./widgets/Footer";
import { Hero } from "./widgets/Hero";
import { Journey } from "./widgets/Journey";
import { Nav } from "./widgets/Nav";
import { RouteIndex } from "./widgets/RouteIndex";

function App() {
  const [mult, setMult] = useState(1);
  const activeCity = useActiveCity(TRIP.cities);

  return (
    <div className="relative">
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
