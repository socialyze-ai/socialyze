import { LayoutGrid, Play, SquarePlus } from "lucide-react";
import { CSSProperties, RefObject } from "react";

const InstagramProfilePreview = ({
  previewBoxRef,
  getGridPreviewStyle,
  canvasCount,
  renderCell,
}: {
  previewBoxRef: RefObject<HTMLDivElement>;
  getGridPreviewStyle: () => CSSProperties;
  canvasCount: number;
  renderCell: (index: number) => React.ReactNode;
}) => {
  return (
    <div className="w-[350px] mx-auto bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-1">
          <span className="font-medium text-sm">@username</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="#1DA1F2"
            stroke="none"
          >
            <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
          </svg>
        </div>
        <div className="flex items-center gap-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </div>
      </div>

      {/* Profile info section */}
      <div className="py-3">
        <div className="flex w-full gap-10 items-center mb-2 px-4">
          {/* Profile picture */}
          <div className="w-[77px] h-[77px] rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white p-[2px]">
              <div className="w-full h-full rounded-full bg-gray-200"></div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex space-x-4 text-center">
            <div className="flex flex-col">
              <span className="font-semibold">{canvasCount}</span>
              <span className="text-sm text-gray-600">Posts</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">1000</span>
              <span className="text-sm text-gray-600">Followers</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">400</span>
              <span className="text-sm text-gray-600">Following</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="px-4 mb-2">
          <p className="font-semibold">Display Name</p>
          <p className="text-sm">Bio text goes here</p>
        </div>

        {/* Action Buttons */}
        <div className="px-4 flex gap-2">
          <button className="flex-1 bg-gray-100 py-1.5 rounded-md font-semibold text-sm">
            Edit Profile
          </button>
          <button className="flex-1 bg-gray-100 py-1.5 rounded-md font-semibold text-sm">
            Share Profile
          </button>
        </div>
      </div>

      {/* Post Grid */}
      <div className="border-t border-gray-200">
        <div className="flex justify-around py-2 border-b border-gray-200">
          <LayoutGrid />

          <Play />

          <SquarePlus />
        </div>
        <div
          ref={previewBoxRef}
          className="grid gap-[1px] bg-white"
          style={{
            ...getGridPreviewStyle(),
            maxWidth: "100%",
          }}
        >
          {Array.from({ length: canvasCount }).map((_, i) => renderCell(i))}
        </div>
      </div>
    </div>
  );
};

export default InstagramProfilePreview;
