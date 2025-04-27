import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List, Grid, Calendar } from "lucide-react";

export type LayoutType = "list" | "grid" | "calendar";

interface LayoutSelectorProps {
  activeLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  activeLayout,
  onLayoutChange,
}) => {
  return (
    <Card>
      <CardContent className="p-1.5 flex">
        <Button
          variant={activeLayout === "list" ? "default" : "ghost"}
          className="flex-1"
          onClick={() => onLayoutChange("list")}
        >
          <List className="h-4 w-4" />
          List
        </Button>
        <Button
          variant={activeLayout === "grid" ? "default" : "ghost"}
          className="flex-1"
          onClick={() => onLayoutChange("grid")}
        >
          <Grid className="h-4 w-4" />
          Grid
        </Button>
        <Button
          variant={activeLayout === "calendar" ? "default" : "ghost"}
          className="flex-1"
          onClick={() => onLayoutChange("calendar")}
        >
          <Calendar className="h-4 w-4" />
          Calendar
        </Button>
      </CardContent>
    </Card>
  );
};

export default LayoutSelector;
