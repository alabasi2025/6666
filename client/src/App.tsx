import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomSystem from "./pages/CustomSystem";

function Router() {
  const DEMO_MODE = import.meta.env.DEV || !import.meta.env.VITE_REQUIRE_AUTH;
  
  return (
    <Switch>
      <Route path="/" component={DEMO_MODE ? Dashboard : Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/:module" component={Dashboard} />
      <Route path="/dashboard/:module/:submodule" component={Dashboard} />
      <Route path="/dashboard/:module/:action/:id" component={Dashboard} />
      {/* Custom System - نظام مستقل */}
      <Route path="/custom" component={CustomSystem} />
      <Route path="/custom/:page" component={CustomSystem} />
      <Route path="/custom/:page/:action" component={CustomSystem} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: 'oklch(0.17 0.02 260)',
                border: '1px solid oklch(0.28 0.02 260)',
                color: 'oklch(0.95 0.01 260)',
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
