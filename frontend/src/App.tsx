import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { PostsProvider } from "@/context/PostsContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addChannels } from "@/redux/slices/posts.slice";
import { useGetChannel } from "@/api/apiHooks/useChannel";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreatePost from "./pages/CreatePost";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Channels from "./pages/Channels";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import PublicRoute from "./components/PublicRoute";
import { Authenticate } from "./pages/Authenticate";

const queryClient = new QueryClient();

// Add a component to load initial data
const InitialDataLoader = () => {
  const dispatch = useDispatch();
  const { data: channelsData } = useGetChannel();

  useEffect(() => {
    if (channelsData?.data?.length) {
      const channels = channelsData.data.map((channel: any) => ({
        id: channel._id,
        type: channel.handle,
        name: channel.channelName,
        username: channel.channelName,
        description: "",
        profileImage: channel.channelPicture,
        connected: true,
        workspace: channel.workspace,
        channelId: channel.channelId,
      }));

      dispatch(addChannels(channels));
    }
  }, [channelsData, dispatch]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PostsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <InitialDataLoader />
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

              {/* Protected routes with authentication bypassed for development */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <Calendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/channels"
                element={
                  <ProtectedRoute>
                    <Channels />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/authenticate"
                element={
                  <ProtectedRoute>
                    <Authenticate />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PostsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
