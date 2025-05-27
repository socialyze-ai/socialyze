import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import FontLoader from "@/components/FontLoader";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreatePost from "./pages/CreatePost";
import Analytics from "./pages/Analytics";
import Channels from "./pages/Channels";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import PublicRoute from "./components/PublicRoute";
import { Authenticate } from "./pages/Authenticate";
import InitialDataLoader from "./components/InitialDataLoader";
import CalenderPage from "./pages/CalenderPage";
import OTP from "./pages/OTP";

const queryClient = new QueryClient();

// Layout component that includes InitialDataLoader for authenticated routes
const AuthenticatedLayout = () => {
  return (
    <>
      <InitialDataLoader />
      <Outlet />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <FontLoader loadOnMount={true} withEvents={true}>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Direct users to dashboard for development */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                }
              />

              <Route
                path="/otp"
                element={
                  <PublicRoute>
                    <OTP />
                  </PublicRoute>
                }
              />

              {/* Protected routes with layout that includes InitialDataLoader */}
              <Route
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create" element={<CreatePost />} />
                <Route path="/calendar" element={<CalenderPage />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/channels" element={<Channels />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/authenticate" element={<Authenticate />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </FontLoader>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
