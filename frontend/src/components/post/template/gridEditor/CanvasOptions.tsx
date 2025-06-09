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
import {
  Check,
  RefreshCcw,
  Save,
  Type,
  Grid,
  PanelRight,
  Palette,
  Grid2x2Plus,
  Proportions,
} from "lucide-react";
import MediaUploader, { Media } from "../../MediaUploader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  useCreatePostTemplatesCustom,
  useCreatePostTemplatesDefault,
} from "@/api/apiHooks/useTemplate";
import { toast } from "sonner";
import { isUserAdmin } from "@/api/apiHooks/utils";

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
  activeCategoryId,
  templateData,
}: {
  handleTemplateSaveAndUse: (isSave: boolean) => void;
  isLoading: boolean;
  columns: number;
  setColumns: (columns: number) => void;
  rows: number;
  setRows: (rows: number) => void;
  handleMediaChange: (media: Media[]) => void;
  handleAddText: () => void;
  activeCategoryId: string;
  templateData: any;
}) => {
  const dispatch = useDispatch();
  const { aspectRatio, backgroundColor } = useSelector((state: RootState) => state.template);
  const { mutate: createTemplate, isPending: isPendingDefault } = useCreatePostTemplatesDefault();
  const { mutate: createTemplateCustom, isPending: isPendingCustom } =
    useCreatePostTemplatesCustom();

  const handleSaveOrUse = (isSave: boolean) => {
    if (!activeCategoryId) {
      toast.error("No category selected. Please select a category first.");
      return;
    }

    if (isUserAdmin()) {
      // Use the template data from the parent component
      createTemplate(
        {
          type: "default",
          postCategory: activeCategoryId,
          body: templateData,
        },
        {
          onSuccess: (data) => {
            toast.success(isSave ? "Template saved successfully" : "Template applied successfully");
            // Call the original handler after API success
            handleTemplateSaveAndUse(isSave);
          },
          onError: (error: any) => {
            toast.error(error.message || `Failed to ${isSave ? "save" : "use"} template`);
          },
        },
      );
    } else {
      createTemplateCustom(
        {
          type: "custom",
          postCategory: activeCategoryId,
          body: templateData,
        },
        {
          onSuccess: (data) => {
            toast.success(isSave ? "Template saved successfully" : "Template applied successfully");
            // Call the original handler after API success
            handleTemplateSaveAndUse(isSave);
          },
          onError: (error: any) => {
            toast.error(error.message || `Failed to ${isSave ? "save" : "use"} template`);
          },
        },
      );
    }
  };

  return (
    <div className="flex gap-2 w-full justify-between h-fit p-2 bg-white rounded-lg shadow">
      <div className="flex items-center gap-2 w-fit">
        <PopoverButton icon={<Grid2x2Plus className="h-5 w-5" />} label="Grid">
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

        {/* <PopoverButton
          icon={<Proportions className="h-5 w-5" />}
          label="Ratio"
          className="w-20 p-0"
        >
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
        </PopoverButton> */}

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

      <div className="flex justify-end gap-2 w-fit">
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              onClick={() => handleSaveOrUse(true)}
              disabled={isLoading || isPendingDefault || isPendingCustom || !activeCategoryId}
              className="shadow"
            >
              {isLoading || isPendingDefault || isPendingCustom ? (
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
              onClick={() => handleSaveOrUse(false)}
              disabled={isLoading || isPendingDefault || isPendingCustom || !activeCategoryId}
              className=" bg-blue-600 text-white shadow"
            >
              {isLoading || isPendingDefault || isPendingCustom ? (
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
