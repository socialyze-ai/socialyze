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
import { Save } from "lucide-react";

const CanvasOptions = ({
  handleTemplateSaveAndUse,
  isLoading,
  columns,
  setColumns,
  rows,
  setRows,
}: {
  handleTemplateSaveAndUse: (isSave: boolean) => void;
  isLoading: boolean;
  columns: number;
  setColumns: (columns: number) => void;
  rows: number;
  setRows: (rows: number) => void;
}) => {
  const dispatch = useDispatch();
  const { aspectRatio, backgroundColor } = useSelector((state: RootState) => state.template);

  return (
    <div className="flex flex-col gap-3 justify-between h-full bg-white p-4 rounded-lg shadow">
      <h3 className="font-medium">Grid Options</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Columns</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={6}
              value={columns}
              onChange={(e) => setColumns(parseInt(e.target.value) || 3)}
              className="w-20"
            />
            <Slider
              value={[columns]}
              min={1}
              max={6}
              step={1}
              onValueChange={(value) => setColumns(value[0])}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Rows</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={6}
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value) || 1)}
              className="w-20"
            />
            <Slider
              value={[rows]}
              min={1}
              max={6}
              step={1}
              onValueChange={(value) => setRows(value[0])}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Aspect Ratio</label>
          <Select value={aspectRatio} onValueChange={(value) => dispatch(setAspectRatio(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select aspect ratio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="16:9">16:9</SelectItem>
              <SelectItem value="1:1">1:1</SelectItem>
              <SelectItem value="4:5">4:5</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm mb-1">Background Color</label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={backgroundColor}
              onChange={(e) => dispatch(setBackgroundColor(e.target.value))}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={backgroundColor}
              onChange={(e) => dispatch(setBackgroundColor(e.target.value))}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => handleTemplateSaveAndUse(true)}
          disabled={isLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Saving..." : "Save"}
        </Button>
        <Button
          className="flex-1"
          onClick={() => handleTemplateSaveAndUse(false)}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Use"}
        </Button>
      </div>
    </div>
  );
};

export default CanvasOptions;
