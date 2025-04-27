import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  BarChart2,
  Settings,
  PlusCircle,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CreatePostModal from "../post/CreatePostModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  onNavItemClick?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onNavItemClick,
  collapsed = false,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
    },
    ...(isMobile
      ? [
          {
            icon: PlusCircle,
            label: "Create",
            href: "/create",
          },
        ]
      : []),
    {
      icon: BarChart2,
      label: "Analytics",
      href: "/analytics",
    },
    {
      icon: Users,
      label: "Channels",
      href: "/channels",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
    },
  ];

  const handleNavClick = () => {
    if (onNavItemClick) {
      onNavItemClick();
    }
  };

  const handleCreateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCreateModalOpen(true);
    handleNavClick();
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "h-full flex flex-col bg-white border-r transition-all duration-300",
          isMobile ? "w-full" : collapsed ? "w-20" : "w-52",
        )}
      >
        <div className="relative p-4">
          <Link to="/dashboard" onClick={handleNavClick}>
            <div className={cn("flex items-center space-x-2 mb-6", collapsed && "justify-center")}>
              <div className="h-8 w-8 rounded-md bg-buffer-blue flex items-center justify-center text-white font-bold">
                S
              </div>
              {!collapsed && <span className="text-xl font-bold">Socialyze</span>}
            </div>
          </Link>

          {!isMobile && (
            <>
              <Button
                className={cn("mb-4", collapsed ? "w-full p-0 h-9" : "w-full")}
                variant="default"
                onClick={handleCreateClick}
              >
                <PlusCircle className={cn("h-4 w-4", !collapsed && "mr-2")} />
                {!collapsed && "Create Post"}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="absolute -right-3.5 top-5 h-7 w-7 rounded-full border bg-white shadow-md"
              >
                {collapsed ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronLeft className="h-3 w-3" />
                )}
              </Button>
            </>
          )}

          <Separator className="my-4" />

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Tooltip key={item.href} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      currentPath === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                    {!collapsed && item.label}
                  </Link>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
              </Tooltip>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t">
          <div className={cn("flex items-center", collapsed ? "justify-center" : "space-x-3")}>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium">JD</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">John Doe</span>
                <span className="text-xs text-muted-foreground">Free Plan</span>
              </div>
            )}
          </div>
        </div>

        <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      </div>
    </TooltipProvider>
  );
};

export default Sidebar;
