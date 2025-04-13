import { v4 as uuidv4 } from "uuid";

interface Media {
  id: string;
  url: string;
  type: "image" | "video";
}

export const DEMO_MEDIA: Media[] = [
  {
    id: uuidv4(),
    url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=500",
    type: "image",
  },
  {
    id: uuidv4(),
    url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=500",
    type: "image",
  },
  {
    id: uuidv4(),
    url: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?q=80&w=500",
    type: "image",
  },
  {
    id: uuidv4(),
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=500",
    type: "image",
  },
  {
    id: uuidv4(),
    url: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=500",
    type: "image",
  },
  {
    id: uuidv4(),
    url: "https://images.unsplash.com/photo-1536782376847-5c9d14d97cc0?q=80&w=500",
    type: "image",
  },
];
