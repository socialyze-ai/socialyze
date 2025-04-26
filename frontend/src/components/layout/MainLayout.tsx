import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebarState } from "@/hooks/use-sidebar-state";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

const ComingSoon = () => {
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center h-full w-full bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center">
        <p className="text-2xl font-bold">Coming Soon</p>
        <p className="text-sm text-muted-foreground">This feature is coming soon.</p>
      </div>
    </div>
  );
};

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useSidebarState();

  const location = useLocation();

  // Restricted paths that are not yet implemented
  const comingSoonPaths = ["/calendar", "/analytics", "/settings"];

  const showComingSoon = comingSoonPaths.some((path) => location.pathname.includes(path));

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {isMobile ? (
        // Mobile layout with sidebar in a sheet
        <>
          <Header
            title={title}
            user={user}
            leftContent={
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <Sidebar onNavItemClick={() => setSidebarOpen(false)} />
                </SheetContent>
              </Sheet>
            }
          />
          <main className="relative flex-1 overflow-y-auto p-4">
            {showComingSoon ? <ComingSoon /> : children}
          </main>
        </>
      ) : (
        // Desktop layout
        <div className="flex h-screen overflow-hidden">
          <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header title={title} user={user} />
            <main className="relative flex-1 overflow-y-auto p-6">
              {showComingSoon ? <ComingSoon /> : children}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
