import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import Tournaments from "./pages/Tournaments";
import TournamentDetail from "./pages/TournamentDetail";
import Rankings from "./pages/Rankings";
import Teams from "./pages/Teams";
import ClanPage from "./pages/ClanPage";
import ClanLeaderRequest from "./pages/ClanLeaderRequest";
import Players from "./pages/Players";
import PlayerProfile from "./pages/PlayerProfile";
import Scrims from "./pages/Scrims";
import Upcoming from "./pages/Upcoming";
import Results from "./pages/Results";
import HallOfFame from "./pages/HallOfFame";
import Creators from "./pages/Creators";
import CreatorRequest from "./pages/CreatorRequest";
import Activity from "./pages/Activity";
import About from "./pages/About";
import Rules from "./pages/Rules";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/tournaments/:tournamentName" element={<TournamentDetail />} />
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/teams/:clanName" element={<ClanPage />} />
              <Route path="/clan-leader-request" element={<ClanLeaderRequest />} />
              <Route path="/players" element={<Players />} />
              <Route path="/player/:nickname" element={<PlayerProfile />} />
              <Route path="/scrims" element={<Scrims />} />
              <Route path="/upcoming" element={<Upcoming />} />
              <Route path="/results" element={<Results />} />
              <Route path="/hall-of-fame" element={<HallOfFame />} />
              <Route path="/creators" element={<Creators />} />
              <Route path="/creator-request" element={<CreatorRequest />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/about" element={<About />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
