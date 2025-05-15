import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // if (loading) {
  //   return (
  //     <div className="h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-buffer-blue"></div>
  //     </div>
  //   );
  // }

  if (isAuthenticated && user?.isVerified) {
    // Check if there's a saved redirect path
    const redirectPath = sessionStorage.getItem("redirectPath");

    // If there is, use it and clear the storage
    if (redirectPath) {
      sessionStorage.removeItem("redirectPath");
      return <Navigate to={redirectPath} replace />;
    }

    // Default redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
