import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Book, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setIsTemplateSectionOpen } from "@/redux/slices/postCreation.slice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useDispatch } from "react-redux";
import TemplateGenerationModal from "./TemplateGenerationModal";
import TemplateCards from "./carouselEditor/TemplateCards";
import CarouselTemplate from "./carouselEditor/CarouselTemplate";
import GridTemplate from "./gridEditor/GridTemplate";
import GridTemplateEditModal from "./gridEditor/TemplateEditModal";
import CarouselTemplateEditModal from "./carouselEditor/TemplateEditModal";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { setSocialPlatform } from "@/redux/slices/template.slice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreatePostCategoryTemplates,
  useGetPostCategoryTemplates,
} from "@/api/apiHooks/useTemplate";
import { toast } from "sonner";

// Keep special template cases
const SPECIAL_TEMPLATES = {
  grid: "Grid",
  carousel: "Carousel",
};

const TemplatePanel = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("facebook");
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ type: "default", name: "" });
  const [categories, setCategories] = useState({
    facebook: [],
    instagram: [],
    linkedin: [],
    x: [],
  });
  const [activeSuggestion, setActiveSuggestion] = useState({
    facebook: "",
    instagram: "",
    linkedin: "",
    x: "",
  });

  const { mutate: createCategory, isPending: isCreating } = useCreatePostCategoryTemplates();
  const { mutate: getCategories, isPending: isLoading } = useGetPostCategoryTemplates();

  // Set Facebook as default tab and dispatch when component mounts
  useEffect(() => {
    setActiveTab("facebook");
    dispatch(setSocialPlatform("facebook"));
    fetchCategories("facebook");
  }, [dispatch]);

  // Fetch categories when active tab changes
  useEffect(() => {
    fetchCategories(activeTab);
  }, [activeTab]);

  const fetchCategories = (handle) => {
    getCategories(
      {
        handle,
        type: "default",
      },
      {
        onSuccess: (data: any) => {
          setCategories((prev) => ({
            ...prev,
            [handle]: data,
          }));

          // Set default selected category based on platform
          let defaultCategory = "";

          if (handle === "instagram") {
            // Instagram defaults to Grid
            defaultCategory = SPECIAL_TEMPLATES.grid;
          } else if (handle === "facebook") {
            // Facebook defaults to Carousel
            defaultCategory = SPECIAL_TEMPLATES.carousel;
          } else if (data.length > 0) {
            // Other platforms default to first API category
            defaultCategory = data[0].name;
          }

          setActiveSuggestion((prev) => ({
            ...prev,
            [handle]: defaultCategory,
          }));
        },
        onError: (error) => {
          toast.error(error.message || `Failed to fetch ${handle} categories`);
        },
      },
    );
  };

  const handleClose = () => {
    dispatch(setIsTemplateSectionOpen(false));
  };

  const handleSuggestionClick = (suggestion, tab) => {
    setActiveSuggestion({
      ...activeSuggestion,
      [tab]: suggestion,
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    createCategory(
      {
        handle: activeTab,
        type: newCategory.type,
        name: newCategory.name,
      },
      {
        onSuccess: () => {
          toast.success("Category added successfully");
          setIsAddCategoryOpen(false);
          setNewCategory({ type: "default", name: "" });
          // Refresh categories
          fetchCategories(activeTab);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to add category");
        },
      },
    );
  };

  const renderCategoryBadges = (platform) => {
    const platformCategories = categories[platform] || [];

    // Add special templates based on platform type
    const displayCategories = [];

    // Instagram has both Grid and Carousel
    if (platform === "instagram") {
      if (!platformCategories.some((cat) => cat.name === SPECIAL_TEMPLATES.grid)) {
        displayCategories.push({ name: SPECIAL_TEMPLATES.grid, _id: "grid-special" });
      }
      if (!platformCategories.some((cat) => cat.name === SPECIAL_TEMPLATES.carousel)) {
        displayCategories.push({ name: SPECIAL_TEMPLATES.carousel, _id: "carousel-special" });
      }
    }
    // Facebook only has Carousel
    else if (platform === "facebook") {
      if (!platformCategories.some((cat) => cat.name === SPECIAL_TEMPLATES.carousel)) {
        displayCategories.push({ name: SPECIAL_TEMPLATES.carousel, _id: "carousel-special" });
      }
    }
    // Other platforms don't have special templates

    // Add API categories
    platformCategories.forEach((cat) => displayCategories.push(cat));

    return (
      <div className="flex flex-wrap gap-1 items-center">
        {isLoading && <div className="text-sm text-gray-500">Loading categories...</div>}
        {!isLoading && displayCategories.length === 0 && (
          <div className="text-sm text-gray-500">No categories found</div>
        )}
        {displayCategories.map((category) => (
          <Badge
            key={category._id}
            className="cursor-pointer"
            variant={activeSuggestion[platform] === category.name ? "default" : "outline"}
            onClick={() => handleSuggestionClick(category.name, platform)}
          >
            {category.name}
          </Badge>
        ))}
        <Button
          className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200 w-5 h-5 rounded-full"
          onClick={() => {
            setIsAddCategoryOpen(true);
          }}
          size="icon"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  const renderTemplateComponent = (tab, suggestion) => {
    if (tab === "instagram" && suggestion === SPECIAL_TEMPLATES.grid) {
      return <GridTemplate socialPlatform={tab} />;
    } else if (
      (tab === "facebook" || tab === "instagram") &&
      suggestion === SPECIAL_TEMPLATES.carousel
    ) {
      return <CarouselTemplate socialPlatform={tab} />;
    } else {
      return <TemplateCards socialPlatform={tab} />;
    }
  };

  return (
    <Card className="w-full h-full flex flex-col border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between p-3 space-y-0 border-b">
        <div className="flex items-center">
          <span className="text-blue-600 font-medium flex items-center text-sm">
            <Book className="h-4 w-4 mr-1" /> Templates
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <TemplateGenerationModal />

      <CardContent className="h-full w-full p-0">
        <Tabs
          defaultValue="facebook"
          className="flex flex-col justify-center"
          onValueChange={(value) => {
            setActiveTab(value);
            dispatch(setSocialPlatform(value));
          }}
        >
          <TabsList className="flex gap-1 overflow-x-auto">
            <TabsTrigger value="facebook">Facebook</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
            <TabsTrigger value="x">X</TabsTrigger>
          </TabsList>

          <div className="h-full pb-2 px-2">
            {activeTab === "facebook" && (
              <TabsContent value="facebook" className="h-full flex flex-col gap-2">
                {renderCategoryBadges("facebook")}
                {renderTemplateComponent("facebook", activeSuggestion.facebook)}
              </TabsContent>
            )}

            {activeTab === "instagram" && (
              <TabsContent value="instagram" className="h-full flex flex-col gap-2">
                {renderCategoryBadges("instagram")}
                {renderTemplateComponent("instagram", activeSuggestion.instagram)}
              </TabsContent>
            )}

            {activeTab === "linkedin" && (
              <TabsContent value="linkedin" className="h-full flex flex-col gap-2">
                {renderCategoryBadges("linkedin")}
                <TemplateCards socialPlatform="linkedin" />
              </TabsContent>
            )}

            {activeTab === "x" && (
              <TabsContent value="x" className="h-full flex flex-col gap-2">
                {renderCategoryBadges("x")}
                <TemplateCards socialPlatform="x" />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </CardContent>

      {(activeTab === "facebook" || activeTab === "instagram") &&
        (activeSuggestion[activeTab] === SPECIAL_TEMPLATES.grid ||
          activeSuggestion[activeTab] === SPECIAL_TEMPLATES.carousel) && (
          <CardFooter className="flex gap-2 justify-end p-3 border-t border-gray-200 bg-white rounded-b">
            {activeSuggestion[activeTab] === SPECIAL_TEMPLATES.grid ? (
              <GridTemplateEditModal socialPlatform={activeTab} />
            ) : (
              <CarouselTemplateEditModal socialPlatform={activeTab} />
            )}
          </CardFooter>
        )}

      {/* Add Category Modal */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="platform" className="text-right">
                Platform
              </Label>
              <Input id="platform" value={activeTab} className="col-span-3" disabled />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Input
                id="type"
                value={newCategory.type}
                className="col-span-3"
                onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newCategory.name}
                className="col-span-3"
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Category name"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} disabled={isCreating}>
              {isCreating ? "Adding..." : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TemplatePanel;
