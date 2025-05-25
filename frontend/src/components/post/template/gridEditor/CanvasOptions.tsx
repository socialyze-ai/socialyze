import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setAspectRatio, setBackgroundColor } from "@/redux/slices/template.slice";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Check, RefreshCcw, Save, Type, Grid, PanelRight, Palette } from "lucide-react";
import MediaUploader, { Media } from "../../MediaUploader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ColorPicker } from "@/components/ui/color-picker";

// Generic PopoverButton component
const PopoverButton = ({
  icon,
  label,
  children,
  className,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  className?: string;
}) => {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="shadow">
              {icon}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
      <PopoverContent side="bottom" className={cn("w-full", className)}>
        {children}
      </PopoverContent>
    </Popover>
  );
};

const CanvasOptions = ({
  handleTemplateSaveAndUse,
  isLoading,
  columns,
  setColumns,
  rows,
  setRows,
  handleMediaChange,
  handleAddText,
}: {
  handleTemplateSaveAndUse: (isSave: boolean) => void;
  isLoading: boolean;
  columns: number;
  setColumns: (columns: number) => void;
  rows: number;
  setRows: (rows: number) => void;
  handleMediaChange: (media: Media[]) => void;
  handleAddText: () => void;
}) => {
  const dispatch = useDispatch();
  const { aspectRatio, backgroundColor } = useSelector((state: RootState) => state.template);

  return (
    <div className="flex gap-2 w-full justify-between h-fit">
      <div className="flex items-center gap-2 w-fit bg-white p-2 rounded-lg shadow">
        <PopoverButton icon={<Grid className="h-5 w-5" />} label="Grid">
          <div className="w-48">
            <p className="text-sm font-medium mb-2">Rows: {rows}</p>
            <Slider
              value={[rows]}
              min={1}
              max={5}
              step={1}
              onValueChange={(value) => setRows(value[0])}
            />
          </div>
        </PopoverButton>

        <PopoverButton icon={<PanelRight className="h-5 w-5" />} label="Ratio" className="w-20 p-0">
          <Select value={aspectRatio} onValueChange={(value) => dispatch(setAspectRatio(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Aspect ratio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="16:9">16:9</SelectItem>
              <SelectItem value="1:1">1:1</SelectItem>
              <SelectItem value="4:5">4:5</SelectItem>
            </SelectContent>
          </Select>
        </PopoverButton>

        <Tooltip>
          <TooltipTrigger>
            <ColorPicker
              value={backgroundColor}
              onChange={(color) => dispatch(setBackgroundColor(color))}
              className="cursor-pointer shadow"
            />
          </TooltipTrigger>
          <TooltipContent>Background</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <MediaUploader
              onlyTriggerButton={true}
              onMediaChange={handleMediaChange}
              iconButtonProps={{ variant: "ghost", className: "shadow" }}
            />
          </TooltipTrigger>
          <TooltipContent>Media</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" size="icon" onClick={handleAddText} className="shadow">
              <Type className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Text</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex justify-end gap-2 w-fit bg-white p-2 rounded-lg shadow">
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              onClick={() => handleTemplateSaveAndUse(true)}
              disabled={isLoading}
              className="shadow"
            >
              {isLoading ? (
                <RefreshCcw className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              Save
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save template</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              onClick={() => handleTemplateSaveAndUse(false)}
              disabled={isLoading}
              className=" bg-blue-600 text-white shadow"
            >
              {isLoading ? (
                <RefreshCcw className="h-5 w-5 animate-spin" />
              ) : (
                <Check className="h-5 w-5" />
              )}
              Use
            </Button>
          </TooltipTrigger>
          <TooltipContent>Use template</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default CanvasOptions;
