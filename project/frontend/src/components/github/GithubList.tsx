"use client";

import { Droppable } from "@hello-pangea/dnd";
import { GitHubProjectItem } from "@/services/github/githubTypes";
import { useTheme } from "next-themes";
import { colors } from "../cardcolor"; // Reuse color scheme
import GitHubCard from "./GithubCard";

interface GitHubListProps {
  listId: string; // e.g., status name like "Todo", "In Progress"
  title: string; // Display title for the list
  items: GitHubProjectItem[];
  // Add other props if needed, like onClick handlers passed down
}

export default function GitHubList({ listId, title, items }: GitHubListProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="w-72 md:w-80 rounded-xl overflow-hidden flex-shrink-0" // Fixed width
      style={{
        backgroundColor: isDark ? colors.list.dark.background : colors.list.light.background,
        boxShadow: isDark ? colors.shadow.dark : colors.shadow.light,
      }}
    >
      {/* List Header */}
      <div
        className="px-4 py-2 flex justify-between items-center sticky top-0 z-10" // Sticky header
        style={{ background: isDark ? colors.primary.gradient.dark : colors.primary.gradient.light }}
      >
        <h3 className="font-semibold text-base text-white truncate">{title}</h3>
         <span className="text-sm font-medium text-white bg-black/20 rounded-full px-2 py-0.5">
            {items.length}
          </span>
        {/* Add dropdown menu for list actions if needed later */}
      </div>

      {/* Cards Area */}
      <Droppable droppableId={listId} type="github-card">
        {(provided, snapshot) => (
          <div
            className={`p-2 space-y-2 min-h-[60px] h-[calc(100vh-240px)] overflow-y-auto ${snapshot.isDraggingOver ? (isDark ? 'bg-slate-700/50' : 'bg-slate-200/50') : ''}`} // Styling for drag over
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {items.map((item, index) => (
              <GitHubCard
                key={item.id}
                item={item}
                index={index}
                // Pass onClick if needed: onClick={onCardClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
       {/* Add Card section removed - GitHub items are typically added via GitHub UI or different API calls */}
    </div>
  );
}