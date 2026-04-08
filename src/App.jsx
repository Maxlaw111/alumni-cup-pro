import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { HomeView } from "./components/views/HomeView";
import { ScheduleView } from "./components/views/ScheduleView";
import { TeamListView } from "./components/views/TeamListView";
import { TeamDetailView } from "./components/views/TeamDetailView";
import { PredictView } from "./components/views/PredictView";

import { BracketView } from "./components/views/BracketView";
import { AdminDashboard } from "./components/views/AdminDashboard";
import { TeamProfilesView } from "./components/views/TeamProfilesView";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans">
        <main className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/schedule" element={<ScheduleView />} />
            <Route path="/bracket" element={<BracketView />} />
            <Route path="/teams" element={<TeamListView />} />
            <Route path="/teams/:teamName" element={<TeamDetailView />} />
            <Route path="/predict" element={<PredictView />} />
            <Route path="/analysis" element={<TeamProfilesView />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Navigation />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
