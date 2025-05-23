import PostTemplatePreview from "../../PostTemplatePreview";
import { Badge } from "@/components/ui/badge";
import { useDispatch } from "react-redux";
import {
  setImages,
  setText,
  setAspectRatio,
  setCanvasCount,
  setBackgroundColor,
} from "@/redux/slices/template.slice";
import TemplateEditModal from "./TemplateEditModal";
import { useState } from "react";

const dummyData = [
  {
    name: "Template 1",
    template: {
      aspectRatio: "1:1",
      backgroundColor: "#ffffff",
      canvasCount: 3,
      sections: [
        {
          index: 0,
          images: [
            {
              id: "b837fde7-39b5-4a8e-b5a2-303f9fdb69c3",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/b837fde7-39b5-4a8e-b5a2-303f9fdb69c3/257b46e1-61b3-45e9-9af4-bf6210714a30_unsplash-media.jpeg",
              position: {
                x: -18,
                y: -10.399999999999977,
              },
              size: {
                width: 403.19999999999993,
                height: 268.79999999999995,
              },
              canvasIndex: 0,
              clipping: {
                start: true,
                clipAmount: 18,
              },
            },
          ],
          texts: [],
        },
        {
          index: 1,
          images: [
            {
              id: "b837fde7-39b5-4a8e-b5a2-303f9fdb69c3",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/b837fde7-39b5-4a8e-b5a2-303f9fdb69c3/257b46e1-61b3-45e9-9af4-bf6210714a30_unsplash-media.jpeg",
              position: {
                x: -18,
                y: -10.399999999999977,
              },
              size: {
                width: 403.19999999999993,
                height: 268.79999999999995,
              },
              canvasIndex: 0,
              clipping: {
                start: true,
                clipAmount: 146,
              },
            },
          ],
          texts: [],
        },
        {
          index: 2,
          images: [
            {
              id: "b837fde7-39b5-4a8e-b5a2-303f9fdb69c3",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/b837fde7-39b5-4a8e-b5a2-303f9fdb69c3/257b46e1-61b3-45e9-9af4-bf6210714a30_unsplash-media.jpeg",
              position: {
                x: -18,
                y: -10.399999999999977,
              },
              size: {
                width: 403.19999999999993,
                height: 268.79999999999995,
              },
              canvasIndex: 0,
              clipping: {
                start: true,
                clipAmount: 274,
              },
            },
            {
              id: "4c28a88b-58b4-4663-bb51-e4ed56452ac3",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/4c28a88b-58b4-4663-bb51-e4ed56452ac3/8f6d0d56-3780-45db-81c4-3f18b5fc6af7_unsplash-media.jpeg",
              position: {
                x: 359.40000000000003,
                y: -1.3999999999999773,
              },
              size: {
                width: 179.19999999999996,
                height: 268.79999999999995,
              },
              canvasIndex: 2,
              clipping: {
                end: true,
                clipAmount: 154.60000000000002,
              },
            },
          ],
          texts: [],
        },
      ],
    },
    outputUrls: [
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/48d70eb1-6eed-42b6-831e-aa798576292b/39cbf576-7768-429b-b784-d13f49290c97_template-section-1.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/7a42c4ed-6c08-40a7-8acb-d2cc16258bae/3503bf25-f308-4979-b446-27f13b6dac8b_template-section-2.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/cb9759a4-6790-47cb-b5b5-3d5c5c004e16/5e10aeda-119e-4c97-8838-7a954afded09_template-section-3.png",
    ],
  },
  {
    name: "Template 2",
    template: {
      aspectRatio: "1:1",
      backgroundColor: "#ffffff",
      canvasCount: 3,
      sections: [
        {
          index: 0,
          images: [
            {
              id: "164afd67-e3f4-4457-beea-23a9d5dcb9af",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/c4b3f8f4-cf50-44e9-b1df-e781a29d542f/d1b36cda-6a49-4cb8-8b77-9a847a9d5ce7_edited_image_164afd67-e3f4-4457-beea-23a9d5dcb9af.png",
              position: {
                x: -104,
                y: -17.399999999999977,
              },
              size: {
                width: 387.8666666666666,
                height: 218.17499999999998,
              },
              canvasIndex: 0,
              clipping: {
                start: true,
                clipAmount: 104,
              },
            },
          ],
          texts: [],
        },
        {
          index: 1,
          images: [
            {
              id: "164afd67-e3f4-4457-beea-23a9d5dcb9af",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/c4b3f8f4-cf50-44e9-b1df-e781a29d542f/d1b36cda-6a49-4cb8-8b77-9a847a9d5ce7_edited_image_164afd67-e3f4-4457-beea-23a9d5dcb9af.png",
              position: {
                x: -104,
                y: -17.399999999999977,
              },
              size: {
                width: 387.8666666666666,
                height: 218.17499999999998,
              },
              canvasIndex: 0,
              clipping: {
                start: true,
                clipAmount: 232,
              },
            },
          ],
          texts: [],
        },
        {
          index: 2,
          images: [
            {
              id: "b89c7ae9-4e32-4789-8e0f-f5af3a85d9c6",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/b89c7ae9-4e32-4789-8e0f-f5af3a85d9c6/34045783-14b8-4861-b688-876089bf3cf8_unsplash-media.jpeg",
              position: {
                x: 300.40000000000003,
                y: 19.600000000000023,
              },
              size: {
                width: 179.19999999999996,
                height: 268.79999999999995,
              },
              canvasIndex: 2,
              clipping: {
                end: true,
                clipAmount: 95.60000000000002,
              },
            },
            {
              id: "164afd67-e3f4-4457-beea-23a9d5dcb9af",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/c4b3f8f4-cf50-44e9-b1df-e781a29d542f/d1b36cda-6a49-4cb8-8b77-9a847a9d5ce7_edited_image_164afd67-e3f4-4457-beea-23a9d5dcb9af.png",
              position: {
                x: -104,
                y: -17.399999999999977,
              },
              size: {
                width: 387.8666666666666,
                height: 218.17499999999998,
              },
              canvasIndex: 0,
              clipping: {
                start: true,
                clipAmount: 360,
              },
            },
          ],
          texts: [],
        },
      ],
    },
    outputUrls: [
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/987f9c74-f667-4afb-9565-c281eda72c71/9d04dd8b-954d-4702-9e57-e47f290ed38c_template-section-2.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/e61bc563-758f-4736-9c65-d8a2a9bc4b25/6a4bf246-258c-4d02-a163-e0c57ab37eb4_template-section-3.png",
    ],
  },
  {
    name: "Template 3",
    template: {
      aspectRatio: "1:1",
      backgroundColor: "#ffffff",
      canvasCount: 3,
      sections: [
        {
          index: 0,
          images: [
            {
              id: "164afd67-e3f4-4457-beea-23a9d5dcb9af",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/c4b3f8f4-cf50-44e9-b1df-e781a29d542f/d1b36cda-6a49-4cb8-8b77-9a847a9d5ce7_edited_image_164afd67-e3f4-4457-beea-23a9d5dcb9af.png",
              position: {
                x: -104,
                y: -17.399999999999977,
              },
              size: {
                width: 387.8666666666666,
                height: 218.17499999999998,
              },
              canvasIndex: 0,
              clipping: {
                start: true,
                clipAmount: 104,
              },
            },
          ],
          texts: [
            {
              id: "text-1747993523663",
              content: "Hwllo world",
              position: {
                x: 79,
                y: 67,
              },
              style: {
                fontSize: 49,
                color: "#000000",
                fontFamily: "Ubuntu",
                fontWeight: "500",
                rotation: 0,
              },
              size: {
                width: 323.4,
                height: 58.8,
              },
              canvasIndex: 0,
              clipping: {
                end: true,
                clipAmount: 274.4,
              },
            },
          ],
        },
        {
          index: 1,
          images: [
            {
              id: "164afd67-e3f4-4457-beea-23a9d5dcb9af",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/c4b3f8f4-cf50-44e9-b1df-e781a29d542f/d1b36cda-6a49-4cb8-8b77-9a847a9d5ce7_edited_image_164afd67-e3f4-4457-beea-23a9d5dcb9af.png",
              position: {
                x: -104,
                y: -17.399999999999977,
              },
              size: {
                width: 387.8666666666666,
                height: 218.17499999999998,
              },
              canvasIndex: 0,
              clipping: {
                start: true,
                clipAmount: 232,
              },
            },
          ],
          texts: [
            {
              id: "text-1747993523663",
              content: "Hwllo world",
              position: {
                x: 79,
                y: 67,
              },
              style: {
                fontSize: 49,
                color: "#000000",
                fontFamily: "Ubuntu",
                fontWeight: "500",
                rotation: 0,
              },
              size: {
                width: 323.4,
                height: 58.8,
              },
              canvasIndex: 0,
              clipping: {
                start: true,
                clipAmount: 49,
              },
            },
          ],
        },
        {
          index: 2,
          images: [
            {
              id: "164afd67-e3f4-4457-beea-23a9d5dcb9af",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/c4b3f8f4-cf50-44e9-b1df-e781a29d542f/d1b36cda-6a49-4cb8-8b77-9a847a9d5ce7_edited_image_164afd67-e3f4-4457-beea-23a9d5dcb9af.png",
              position: {
                x: -104,
                y: -17.399999999999977,
              },
              size: {
                width: 387.8666666666666,
                height: 218.17499999999998,
              },
              canvasIndex: 0,
              clipping: {
                start: true,
                clipAmount: 360,
              },
            },
            {
              id: "b89c7ae9-4e32-4789-8e0f-f5af3a85d9c6",
              src: "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/b89c7ae9-4e32-4789-8e0f-f5af3a85d9c6/34045783-14b8-4861-b688-876089bf3cf8_unsplash-media.jpeg",
              position: {
                x: 300.40000000000003,
                y: 19.600000000000023,
              },
              size: {
                width: 179.19999999999996,
                height: 268.79999999999995,
              },
              canvasIndex: 2,
              clipping: {
                end: true,
                clipAmount: 95.60000000000002,
              },
            },
          ],
          texts: [
            {
              id: "text-1747993523663",
              content: "Hwllo world",
              position: {
                x: 79,
                y: 67,
              },
              style: {
                fontSize: 49,
                color: "#000000",
                fontFamily: "Ubuntu",
                fontWeight: "500",
                rotation: 0,
              },
              size: {
                width: 323.4,
                height: 58.8,
              },
              canvasIndex: 0,
              clipping: {
                start: true,
                clipAmount: 177,
              },
            },
          ],
        },
      ],
    },
    outputUrls: [
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/dc4437db-4d55-4d95-b002-cff4f6335984/507ccae4-b139-490f-9804-1a255820a2d6_template-section-1.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/80706d24-2cea-4be4-a64a-35fd078841c5/343901b6-54f4-43dd-bff6-f2487a7c5945_template-section-2.png",
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/1ad5a697-5c4a-45f9-89b8-8370f2035048/17e996bd-84c4-4efc-a725-410ee5627bba_template-section-3.png",
    ],
  },
];

const CarouselTemplate = () => {
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
    <div className="h-full w-full border p-2 flex flex-col gap-2 rounded-xl">
      {dummyData.map((data, index) => (
        <div key={index} className="h-full w-full border p-2 flex flex-col gap-2 rounded-xl">
          <div className="flex justify-between">
            <p>{data?.name}</p>

            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-blue-600 hover:text-white"
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

export default CarouselTemplate;
