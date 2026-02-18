import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import CreateRequest from "@/pages/CreateRequest";
import RequestDetails from "@/pages/RequestDetails";
import Invoices from "@/pages/Invoices";
import PaymentSuccess from "@/pages/PaymentSuccess";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (isLoading || profileLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  // If user exists but no profile, redirect to onboarding
  // Unless we are already on onboarding page (handled by router)
  if (!profile) {
    return <Onboarding />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/create-request">
        <ProtectedRoute component={CreateRequest} />
      </Route>
      <Route path="/requests/:id">
        <ProtectedRoute component={RequestDetails} />
      </Route>
      <Route path="/invoices">
        <ProtectedRoute component={Invoices} />
      </Route>
      <Route path="/payment/success">
        <ProtectedRoute component={PaymentSuccess} />
      </Route>
      <Route path="/onboarding">
        <ProtectedRoute component={Onboarding} />
      </Route>
      
      {/* Fallbacks / 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
