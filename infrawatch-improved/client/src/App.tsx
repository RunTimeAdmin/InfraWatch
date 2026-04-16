import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Validators from "./pages/Validators";
import RpcHealth from "./pages/RpcHealth";
import DataCenterMap from "./pages/DataCenterMap";
import MevTracker from "./pages/MevTracker";
import BagsEcosystem from "./pages/BagsEcosystem";
import Alerts from "./pages/Alerts";
import AppLayout from "./components/layout/AppLayout";

/**
 * InfraWatch - Solana Infrastructure Monitor
 * Enhanced frontend with improved UI/UX, real-time data visualization,
 * and production-ready features.
 */

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={() => <AppLayout><Dashboard /></AppLayout>} />
      <Route path={"/validators"} component={() => <AppLayout><Validators /></AppLayout>} />
      <Route path={"/rpc"} component={() => <AppLayout><RpcHealth /></AppLayout>} />
      <Route path={"/map"} component={() => <AppLayout><DataCenterMap /></AppLayout>} />
      <Route path={"/mev"} component={() => <AppLayout><MevTracker /></AppLayout>} />
      <Route path={"/bags"} component={() => <AppLayout><BagsEcosystem /></AppLayout>} />
      <Route path={"/alerts"} component={() => <AppLayout><Alerts /></AppLayout>} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
