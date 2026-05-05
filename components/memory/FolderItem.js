"use client";

export default function FolderItem({ folder, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition
        ${
          active
            ? "bg-gray-100 font-medium"
            : "hover:bg-gray-50"
        }`}
    >
      {/* Better icon */}
      <span className="text-gray-500">📁</span>

      <span className="truncate">{folder.name}</span>
    </div>
  );
}