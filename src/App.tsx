import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Deposits from "@/pages/deposits";
import Users from "@/pages/users";
import Products from "@/pages/products";
import Stock from "@/pages/stock";
import Analytics from "@/pages/analytics";
import Broadcast from "@/pages/broadcast";
import AuditLogs from "@/pages/audit-logs";
import Settings from "@/pages/settings";
import Panduan from "@/pages/panduan";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useEffect(() => {
    const root = window.document.documentElement;
    const theme = localStorage.getItem("theme") || "dark";
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Switch>
              <Route path="/">
                <Redirect to="/dashboard" />
              </Route>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/transactions" component={Transactions} />
              <Route path="/deposits" component={Deposits} />
              <Route path="/users" component={Users} />
              <Route path="/products" component={Products} />
              <Route path="/stock" component={Stock} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/broadcast" component={Broadcast} />
              <Route path="/audit-logs" component={AuditLogs} />
              <Route path="/settings" component={Settings} />
              <Route path="/panduan" component={Panduan} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
