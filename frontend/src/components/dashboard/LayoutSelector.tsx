import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Grid, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export type LayoutType = "list" | "grid" | "calendar";

interface LayoutSelectorProps {
  activeLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({ activeLayout, onLayoutChange }) => {
  return (
    <Tabs defaultValue={activeLayout} onValueChange={onLayoutChange}>
      <TabsList className="grid grid-cols-3 gap-1 bg-gray-100 rounded-md p-1">
        <TabsTrigger
          value="list"
          className={cn(
            "flex gap-1 items-center justify-center",
            activeLayout === "list" ? "bg-white shadow-sm" : "hover:bg-muted",
          )}
        >
          <List className="h-4 w-4" />
          <span>List</span>
        </TabsTrigger>
        <TabsTrigger
          value="grid"
          className={cn(
            "flex gap-1 items-center justify-center",
            activeLayout === "grid" ? "bg-white shadow-sm" : "hover:bg-muted",
          )}
        >
          <Grid className="h-4 w-4" />
          <span>Grid</span>
        </TabsTrigger>
        <TabsTrigger
          value="calendar"
          className={cn(
            "flex gap-1 items-center justify-center",
            activeLayout === "calendar" ? "bg-white shadow-sm" : "hover:bg-muted",
          )}
        >
          <Calendar className="h-4 w-4" />
          <span>Calendar</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default LayoutSelector;
