import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List, Grid, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export type LayoutType = "list" | "grid" | "calendar";

interface LayoutSelectorProps {
  activeLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({ activeLayout, onLayoutChange }) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="px-3 py-2 pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">View Mode</CardTitle>
      </CardHeader>
      <CardContent className="p-1.5">
        <div className="grid grid-cols-3 gap-1">
          <Button
            variant={activeLayout === "list" ? "default" : "ghost"}
            className={cn(
              "flex gap-1 items-center justify-center",
              activeLayout === "list" ? "" : "hover:bg-muted",
            )}
            onClick={() => onLayoutChange("list")}
            size="sm"
          >
            <List className="h-4 w-4" />
            <span>List</span>
          </Button>
          <Button
            variant={activeLayout === "grid" ? "default" : "ghost"}
            className={cn(
              "flex gap-1 items-center justify-center",
              activeLayout === "grid" ? "" : "hover:bg-muted",
            )}
            onClick={() => onLayoutChange("grid")}
            size="sm"
          >
            <Grid className="h-4 w-4" />
            <span>Grid</span>
          </Button>
          <Button
            variant={activeLayout === "calendar" ? "default" : "ghost"}
            className={cn(
              "flex gap-1 items-center justify-center",
              activeLayout === "calendar" ? "" : "hover:bg-muted",
            )}
            onClick={() => onLayoutChange("calendar")}
            size="sm"
          >
            <Calendar className="h-4 w-4" />
            <span>Calendar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LayoutSelector;
