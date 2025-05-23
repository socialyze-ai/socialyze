import PostTemplatePreview from "../../PostTemplatePreview";
import { Badge } from "@/components/ui/badge";
import { useDispatch } from "react-redux";
import {
  setImages,
  setText,
  setAspectRatio,
  setCanvasCount,
  setBackgroundColor,
  setGridSize,
} from "@/redux/slices/template.slice";
import TemplateEditModal from "./TemplateEditModal";
import { useState } from "react";

const dummyData = [
  {
    name: "Grid Template 1",
    template: {
      aspectRatio: "1:1",
      backgroundColor: "#ffffff",
      canvasCount: 9,
      gridSize: {
        columns: 3,
        rows: 3,
      },
      sections: [
        {
          index: 0,
          row: 0,
          col: 0,
          images: [
            {
              id: "b837fde7-39b5-4a8e-b5a2-303f9fdb69c3",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/b837fde7-39b5-4a8e-b5a2-303f9fdb69c3/257b46e1-61b3-45e9-9af4-bf6210714a30_unsplash-media.jpeg",
              position: {
                x: 10,
                y: 10,
              },
              size: {
                width: 284,
                height: 284,
              },
              canvasIndex: 0,
              clipping: {
                x: {
                  end: true,
                  clipAmount: 105,
                },
                y: {
                  end: true,
                  clipAmount: 105,
                },
              },
            },
          ],
          texts: [],
        },
        {
          index: 1,
          row: 0,
          col: 1,
          images: [
            {
              id: "b837fde7-39b5-4a8e-b5a2-303f9fdb69c3",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/b837fde7-39b5-4a8e-b5a2-303f9fdb69c3/257b46e1-61b3-45e9-9af4-bf6210714a30_unsplash-media.jpeg",
              position: {
                x: 10,
                y: 10,
              },
              size: {
                width: 284,
                height: 284,
              },
              canvasIndex: 0,
              clipping: {
                x: {
                  start: true,
                  clipAmount: 179,
                },
                y: {
                  end: true,
                  clipAmount: 105,
                },
              },
            },
            {
              id: "b89c7ae9-4e32-4789-8e0f-f5af3a85d9c6",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/b89c7ae9-4e32-4789-8e0f-f5af3a85d9c6/34045783-14b8-4861-b688-876089bf3cf8_unsplash-media.jpeg",
              position: {
                x: 233,
                y: 0,
              },
              size: {
                width: 318,
                height: 318,
              },
              canvasIndex: 5,
              clipping: {
                x: {
                  end: true,
                  clipAmount: 173,
                },
                y: {
                  end: true,
                  clipAmount: 129,
                },
              },
            },
          ],
          texts: [],
        },
        {
          index: 2,
          row: 0,
          col: 2,
          images: [
            {
              id: "b89c7ae9-4e32-4789-8e0f-f5af3a85d9c6",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/b89c7ae9-4e32-4789-8e0f-f5af3a85d9c6/34045783-14b8-4861-b688-876089bf3cf8_unsplash-media.jpeg",
              position: {
                x: 233,
                y: 0,
              },
              size: {
                width: 318,
                height: 318,
              },
              canvasIndex: 5,
              clipping: {
                x: {
                  start: true,
                  clipAmount: 145,
                },
                y: {
                  end: true,
                  clipAmount: 129,
                },
              },
            },
          ],
          texts: [],
        },
        {
          index: 3,
          row: 1,
          col: 0,
          images: [
            {
              id: "b837fde7-39b5-4a8e-b5a2-303f9fdb69c3",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/b837fde7-39b5-4a8e-b5a2-303f9fdb69c3/257b46e1-61b3-45e9-9af4-bf6210714a30_unsplash-media.jpeg",
              position: {
                x: 10,
                y: 10,
              },
              size: {
                width: 284,
                height: 284,
              },
              canvasIndex: 0,
              clipping: {
                x: {
                  end: true,
                  clipAmount: 105,
                },
                y: {
                  start: true,
                  clipAmount: 179,
                },
              },
            },
            {
              id: "164afd67-e3f4-4457-beea-23a9d5dcb9af",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/c4b3f8f4-cf50-44e9-b1df-e781a29d542f/d1b36cda-6a49-4cb8-8b77-9a847a9d5ce7_edited_image_164afd67-e3f4-4457-beea-23a9d5dcb9af.png",
              position: {
                x: 22,
                y: 307,
              },
              size: {
                width: 244,
                height: 244,
              },
              canvasIndex: 0,
              clipping: {
                x: {
                  end: true,
                  clipAmount: 77,
                },
                y: {
                  end: true,
                  clipAmount: 173,
                },
              },
            },
          ],
          texts: [],
        },
        {
          index: 4,
          row: 1,
          col: 1,
          images: [
            {
              id: "b837fde7-39b5-4a8e-b5a2-303f9fdb69c3",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/b837fde7-39b5-4a8e-b5a2-303f9fdb69c3/257b46e1-61b3-45e9-9af4-bf6210714a30_unsplash-media.jpeg",
              position: {
                x: 10,
                y: 10,
              },
              size: {
                width: 284,
                height: 284,
              },
              canvasIndex: 0,
              clipping: {
                x: {
                  start: true,
                  clipAmount: 179,
                },
                y: {
                  start: true,
                  clipAmount: 179,
                },
              },
            },
            {
              id: "4c28a88b-58b4-4663-bb51-e4ed56452ac3",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/4c28a88b-58b4-4663-bb51-e4ed56452ac3/8f6d0d56-3780-45db-81c4-3f18b5fc6af7_unsplash-media.jpeg",
              position: {
                x: 214,
                y: 277,
              },
              size: {
                width: 322,
                height: 322,
              },
              canvasIndex: 5,
              clipping: {
                x: {
                  end: true,
                  clipAmount: 158,
                },
                y: {
                  end: true,
                  clipAmount: 221,
                },
              },
            },
            {
              id: "164afd67-e3f4-4457-beea-23a9d5dcb9af",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/c4b3f8f4-cf50-44e9-b1df-e781a29d542f/d1b36cda-6a49-4cb8-8b77-9a847a9d5ce7_edited_image_164afd67-e3f4-4457-beea-23a9d5dcb9af.png",
              position: {
                x: 22,
                y: 307,
              },
              size: {
                width: 244,
                height: 244,
              },
              canvasIndex: 0,
              clipping: {
                x: {
                  start: true,
                  clipAmount: 167,
                },
                y: {
                  end: true,
                  clipAmount: 173,
                },
              },
            },
            {
              id: "b89c7ae9-4e32-4789-8e0f-f5af3a85d9c6",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/b89c7ae9-4e32-4789-8e0f-f5af3a85d9c6/34045783-14b8-4861-b688-876089bf3cf8_unsplash-media.jpeg",
              position: {
                x: 233,
                y: 0,
              },
              size: {
                width: 318,
                height: 318,
              },
              canvasIndex: 5,
              clipping: {
                x: {
                  end: true,
                  clipAmount: 173,
                },
                y: {
                  start: true,
                  clipAmount: 189,
                },
              },
            },
          ],
          texts: [],
        },
        {
          index: 5,
          row: 1,
          col: 2,
          images: [
            {
              id: "4c28a88b-58b4-4663-bb51-e4ed56452ac3",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/4c28a88b-58b4-4663-bb51-e4ed56452ac3/8f6d0d56-3780-45db-81c4-3f18b5fc6af7_unsplash-media.jpeg",
              position: {
                x: 214,
                y: 277,
              },
              size: {
                width: 322,
                height: 322,
              },
              canvasIndex: 5,
              clipping: {
                x: {
                  start: true,
                  clipAmount: 164,
                },
                y: {
                  end: true,
                  clipAmount: 221,
                },
              },
            },
            {
              id: "b89c7ae9-4e32-4789-8e0f-f5af3a85d9c6",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/b89c7ae9-4e32-4789-8e0f-f5af3a85d9c6/34045783-14b8-4861-b688-876089bf3cf8_unsplash-media.jpeg",
              position: {
                x: 233,
                y: 0,
              },
              size: {
                width: 318,
                height: 318,
              },
              canvasIndex: 5,
              clipping: {
                x: {
                  start: true,
                  clipAmount: 145,
                },
                y: {
                  start: true,
                  clipAmount: 189,
                },
              },
            },
          ],
          texts: [],
        },
        {
          index: 6,
          row: 2,
          col: 0,
          images: [
            {
              id: "164afd67-e3f4-4457-beea-23a9d5dcb9af",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/c4b3f8f4-cf50-44e9-b1df-e781a29d542f/d1b36cda-6a49-4cb8-8b77-9a847a9d5ce7_edited_image_164afd67-e3f4-4457-beea-23a9d5dcb9af.png",
              position: {
                x: 22,
                y: 307,
              },
              size: {
                width: 244,
                height: 244,
              },
              canvasIndex: 0,
              clipping: {
                x: {
                  end: true,
                  clipAmount: 77,
                },
                y: {
                  start: true,
                  clipAmount: 71,
                },
              },
            },
          ],
          texts: [],
        },
        {
          index: 7,
          row: 2,
          col: 1,
          images: [
            {
              id: "4c28a88b-58b4-4663-bb51-e4ed56452ac3",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/4c28a88b-58b4-4663-bb51-e4ed56452ac3/8f6d0d56-3780-45db-81c4-3f18b5fc6af7_unsplash-media.jpeg",
              position: {
                x: 214,
                y: 277,
              },
              size: {
                width: 322,
                height: 322,
              },
              canvasIndex: 5,
              clipping: {
                x: {
                  end: true,
                  clipAmount: 158,
                },
                y: {
                  start: true,
                  clipAmount: 101,
                },
              },
            },
            {
              id: "164afd67-e3f4-4457-beea-23a9d5dcb9af",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/c4b3f8f4-cf50-44e9-b1df-e781a29d542f/d1b36cda-6a49-4cb8-8b77-9a847a9d5ce7_edited_image_164afd67-e3f4-4457-beea-23a9d5dcb9af.png",
              position: {
                x: 22,
                y: 307,
              },
              size: {
                width: 244,
                height: 244,
              },
              canvasIndex: 0,
              clipping: {
                x: {
                  start: true,
                  clipAmount: 167,
                },
                y: {
                  start: true,
                  clipAmount: 71,
                },
              },
            },
          ],
          texts: [],
        },
        {
          index: 8,
          row: 2,
          col: 2,
          images: [
            {
              id: "4c28a88b-58b4-4663-bb51-e4ed56452ac3",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/4c28a88b-58b4-4663-bb51-e4ed56452ac3/8f6d0d56-3780-45db-81c4-3f18b5fc6af7_unsplash-media.jpeg",
              position: {
                x: 214,
                y: 277,
              },
              size: {
                width: 322,
                height: 322,
              },
              canvasIndex: 5,
              clipping: {
                x: {
                  start: true,
                  clipAmount: 164,
                },
                y: {
                  start: true,
                  clipAmount: 101,
                },
              },
            },
          ],
          texts: [],
        },
      ],
    },
    outputUrls: [
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/3990cfca-f752-41f5-af0c-a036a2b1d397/d58fe988-25ae-4768-9985-fbb7a46ea930_grid-cell-1.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/eccb58c4-774a-48b4-879c-a6c0cd9175bb/4ea3ebfc-8a1b-4cde-b172-9e1f53e29af4_grid-cell-2.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/1a606bf6-7634-46f2-ad48-f16cf7663114/75698c69-feae-4c4c-b03f-35a9df2d46bd_grid-cell-3.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/e78639ea-b1a4-46af-81af-6b6ead47c246/e864be2c-6629-4f73-b319-0a43f6a1094f_grid-cell-4.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/97662464-22fb-442c-bdd4-dc5146fb5c9d/95d92059-44ea-4ba5-a1bf-5df15acfb770_grid-cell-5.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/d1ec9305-0140-4ede-b7c2-c0175864c842/6fcdd712-7ff6-4874-a8f2-5f3e00d77229_grid-cell-6.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/24835789-e7b7-4d45-a616-32c6a5c72916/d0493d66-1f5b-4d7d-9476-17a5ab468707_grid-cell-7.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/7f33277c-cc54-4adb-9ef3-b77f2dd8979a/fba06be5-3b0d-4d9b-a8a8-03631e2c3cf5_grid-cell-8.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/3c79ebc4-7bb4-443b-8698-2be55a0539f4/fae7fd59-ac49-4ae2-ab71-640f440012e5_grid-cell-9.png",
    ],
  },
  {
    name: "Grid Template 2",
    template: {
      aspectRatio: "1:1",
      backgroundColor: "#ffffff",
      canvasCount: 9,
      gridSize: {
        columns: 3,
        rows: 3,
      },
      sections: [
        {
          index: 0,
          row: 0,
          col: 0,
          images: [
            {
              id: "0fd01eef-f8da-43a7-a358-62622230b88c",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/0fd01eef-f8da-43a7-a358-62622230b88c/56ee554d-310f-4367-a109-6fe29a62e888_unsplash-media.jpeg",
              position: {
                x: -4.019999999999982,
                y: -5.899999999999977,
              },
              size: {
                width: 573.04,
                height: 716.3,
              },
              canvasIndex: 0,
              clipping: {
                x: {
                  start: true,
                  clipAmount: 4.019999999999982,
                },
                y: {
                  start: true,
                  clipAmount: 5.899999999999977,
                },
              },
            },
          ],
          texts: [],
        },
        {
          index: 1,
          row: 0,
          col: 1,
          images: [
            {
              id: "0fd01eef-f8da-43a7-a358-62622230b88c",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/0fd01eef-f8da-43a7-a358-62622230b88c/56ee554d-310f-4367-a109-6fe29a62e888_unsplash-media.jpeg",
              position: {
                x: -4.019999999999982,
                y: -5.899999999999977,
              },
              size: {
                width: 573.04,
                height: 716.3,
              },
              canvasIndex: 0,
              clipping: {
                x: {
                  start: true,
                  clipAmount: 193.01999999999998,
                },
                y: {
                  start: true,
                  clipAmount: 5.899999999999977,
                },
              },
            },
          ],
          texts: [],
        },
        {
          index: 2,
          row: 0,
          col: 2,
          images: [
            {
              id: "0fd01eef-f8da-43a7-a358-62622230b88c",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/0fd01eef-f8da-43a7-a358-62622230b88c/56ee554d-310f-4367-a109-6fe29a62e888_unsplash-media.jpeg",
              position: {
                x: -4.019999999999982,
                y: -5.899999999999977,
              },
              size: {
                width: 573.04,
                height: 716.3,
              },
              canvasIndex: 0,
              clipping: {
                x: {
                  start: true,
                  clipAmount: 382.02,
                },
                y: {
                  start: true,
                  clipAmount: 5.899999999999977,
                },
              },
            },
          ],
          texts: [],
        },
        {
          index: 3,
          row: 1,
          col: 0,
          images: [
            {
              id: "0fd01eef-f8da-43a7-a358-62622230b88c",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/0fd01eef-f8da-43a7-a358-62622230b88c/56ee554d-310f-4367-a109-6fe29a62e888_unsplash-media.jpeg",
              position: {
                x: -4.019999999999982,
                y: -5.899999999999977,
              },
              size: {
                width: 573.04,
                height: 716.3,
              },
              canvasIndex: 0,
              clipping: {
                x: {
                  start: true,
                  clipAmount: 4.019999999999982,
                },
                y: {
                  start: true,
                  clipAmount: 194.89999999999998,
                },
              },
            },
          ],
          texts: [],
        },
        {
          index: 4,
          row: 1,
          col: 1,
          images: [
            {
              id: "0fd01eef-f8da-43a7-a358-62622230b88c",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/0fd01eef-f8da-43a7-a358-62622230b88c/56ee554d-310f-4367-a109-6fe29a62e888_unsplash-media.jpeg",
              position: {
                x: -4.019999999999982,
                y: -5.899999999999977,
              },
              size: {
                width: 573.04,
                height: 716.3,
              },
              canvasIndex: 0,
              clipping: {
                x: {
                  start: true,
                  clipAmount: 193.01999999999998,
                },
                y: {
                  start: true,
                  clipAmount: 194.89999999999998,
                },
              },
            },
          ],
          texts: [],
        },
        {
          index: 5,
          row: 1,
          col: 2,
          images: [
            {
              id: "0fd01eef-f8da-43a7-a358-62622230b88c",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/0fd01eef-f8da-43a7-a358-62622230b88c/56ee554d-310f-4367-a109-6fe29a62e888_unsplash-media.jpeg",
              position: {
                x: -4.019999999999982,
                y: -5.899999999999977,
              },
              size: {
                width: 573.04,
                height: 716.3,
              },
              canvasIndex: 0,
              clipping: {
                x: {
                  start: true,
                  clipAmount: 382.02,
                },
                y: {
                  start: true,
                  clipAmount: 194.89999999999998,
                },
              },
            },
          ],
          texts: [],
        },
        {
          index: 6,
          row: 2,
          col: 0,
          images: [
            {
              id: "0fd01eef-f8da-43a7-a358-62622230b88c",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/0fd01eef-f8da-43a7-a358-62622230b88c/56ee554d-310f-4367-a109-6fe29a62e888_unsplash-media.jpeg",
              position: {
                x: -4.019999999999982,
                y: -5.899999999999977,
              },
              size: {
                width: 573.04,
                height: 716.3,
              },
              canvasIndex: 0,
              clipping: {
                x: {
                  start: true,
                  clipAmount: 4.019999999999982,
                },
                y: {
                  start: true,
                  clipAmount: 383.9,
                },
              },
            },
          ],
          texts: [],
        },
        {
          index: 7,
          row: 2,
          col: 1,
          images: [
            {
              id: "0fd01eef-f8da-43a7-a358-62622230b88c",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/0fd01eef-f8da-43a7-a358-62622230b88c/56ee554d-310f-4367-a109-6fe29a62e888_unsplash-media.jpeg",
              position: {
                x: -4.019999999999982,
                y: -5.899999999999977,
              },
              size: {
                width: 573.04,
                height: 716.3,
              },
              canvasIndex: 0,
              clipping: {
                x: {
                  start: true,
                  clipAmount: 193.01999999999998,
                },
                y: {
                  start: true,
                  clipAmount: 383.9,
                },
              },
            },
          ],
          texts: [],
        },
        {
          index: 8,
          row: 2,
          col: 2,
          images: [
            {
              id: "0fd01eef-f8da-43a7-a358-62622230b88c",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/0fd01eef-f8da-43a7-a358-62622230b88c/56ee554d-310f-4367-a109-6fe29a62e888_unsplash-media.jpeg",
              position: {
                x: -4.019999999999982,
                y: -5.899999999999977,
              },
              size: {
                width: 573.04,
                height: 716.3,
              },
              canvasIndex: 0,
              clipping: {
                x: {
                  start: true,
                  clipAmount: 382.02,
                },
                y: {
                  start: true,
                  clipAmount: 383.9,
                },
              },
            },
          ],
          texts: [],
        },
      ],
    },
    outputUrls: [
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/1f1c76ae-bfa3-4fdb-96e7-35ce119800e0/47a09da7-8c9b-4d94-a1aa-ac58fa2d2aa0_grid-cell-1.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/8909aa30-b842-4b25-a26b-7439c2390ab5/4405d5d0-443b-44c0-ae8e-cfb89371283e_grid-cell-2.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/a8b442aa-d568-40a0-9ffd-0467443308c0/f3d601b5-efd0-4a5d-8c9e-d938c4a0ad2d_grid-cell-3.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/6f49391a-d07c-4db1-af1d-693587e62abf/725ed446-cde6-45e6-8e46-4f9e752ef991_grid-cell-4.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/6be7eff4-9287-4366-a4f6-3b8e58680435/1da7bf9a-db04-4fc5-af94-696bc3d9df08_grid-cell-5.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/1fdbf320-f9d3-4e00-b676-8f05d86d4bd7/24f646a3-1607-4854-8fe9-62be22f2fbf9_grid-cell-6.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/5e00cabe-6234-48f0-bde7-cfdee5546f4f/cbc81537-e185-4a05-88f6-9035f51cc3cc_grid-cell-7.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/1872afae-dc3c-4516-802f-2ae5a6553ccd/9245db15-d6af-4ccf-b2e2-420b7cc8aec1_grid-cell-8.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/f874516b-b678-43c8-887a-7264410b729a/a0ee30fa-ef51-43d7-91c1-f524029ea428_grid-cell-9.png",
    ],
  },
];

const GridTemplate = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(null);

  const handleUseTemplate = (data: any, index: number) => {
    // Extract template data
    const { template } = data;

    // Set template data in Redux store
    dispatch(setAspectRatio(template.aspectRatio));
    dispatch(setBackgroundColor(template.backgroundColor));
    dispatch(setCanvasCount(template.canvasCount));
    dispatch(setGridSize(template.gridSize));

    // Extract and set images with deduplication
    const allImages = [];
    const seenImageIds = new Set();

    for (const section of template.sections) {
      for (const image of section.images) {
        // Only add image if we haven't seen its ID before
        if (!seenImageIds.has(image.id)) {
          // Remove clipping info which is calculated dynamically
          const { clipping, ...imageWithoutClipping } = image;
          allImages.push(imageWithoutClipping);
          seenImageIds.add(image.id);
        }
      }
    }
    dispatch(setImages(allImages));

    // Extract and set texts
    const allTexts = [];
    for (const section of template.sections) {
      if (section.texts) {
        for (const text of section.texts) {
          // Remove clipping info which is calculated dynamically
          const { clipping, ...textWithoutClipping } = text;
          allTexts.push(textWithoutClipping);
        }
      }
    }
    dispatch(setText(allTexts));

    // Set selected template index and open modal
    setSelectedTemplateIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="h-[57dvh] w-full overflow-y-auto flex flex-col gap-2">
      {dummyData.map((data, index) => (
        <div
          key={index}
          className="h-full w-full border p-2 flex flex-col gap-2 rounded-xl bg-gray-50"
        >
          <div className="flex justify-between">
            <p>{data?.name}</p>

            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-blue-600 hover:text-white bg-white"
              onClick={() => handleUseTemplate(data, index)}
            >
              Use Template
            </Badge>
          </div>

          <PostTemplatePreview
            content={""}
            channel={{ type: "default" } as any}
            mediaUrls={data?.outputUrls}
            isTemplate
          />
        </div>
      ))}

      {isModalOpen && selectedTemplateIndex !== null && (
        <TemplateEditModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      )}
    </div>
  );
};

export default GridTemplate;
