"use client";

import { Draggable } from "@hello-pangea/dnd"; // If you intend to make these draggable too
import { GitHubProjectItem, GitHubFieldValueNode, GitHubUser } from "@/services/github/githubTypes";
import { useTheme } from "next-themes";
import { colors } from "../cardcolor"; // Reuse your color definitions
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming shadcn/ui Avatar
import { IssueOpenedIcon, GitPullRequestIcon, NoteIcon } from '@primer/octicons-react'; // Example icons
import { Badge } from "@/components/ui/badge";
interface GitHubCardProps {
  item: GitHubProjectItem;
  index: number;
  // onClick: (itemId: string) => void; // Add if you need click handlers
}

// Helper to get a specific field value by field name
const getFieldValue = (item: GitHubProjectItem, fieldName: string): GitHubFieldValueNode | undefined => {
    return item.fieldValues.nodes.find(fv => fv.field?.name?.toLowerCase() === fieldName.toLowerCase());
};

// Helper to display assignee avatars
const AssigneeAvatars = ({ assignees }: { assignees?: GitHubUser[] }) => {
    if (!assignees || assignees.length === 0) return null;
    return (
        <div className="flex -space-x-2 rtl:space-x-reverse mt-2">
            {assignees.slice(0, 3).map(user => ( // Show max 3 avatars
                <Avatar key={user.id || user.login} className="w-6 h-6 border-2 border-white dark:border-gray-800">
                    {/* Ideally, fetch avatar URL via another API call or have it in user data */}
                    {/* <AvatarImage src={user.avatarUrl} /> */}
                    <AvatarFallback className="text-xs">
                        {user.login.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            ))}
            {assignees.length > 3 && (
                 <span className="flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-gray-700 border-2 border-white rounded-full -ms-2 dark:border-gray-800">
                    +{assignees.length - 3}
                 </span>
            )}
        </div>
    );
};

export default function GitHubCard({ item, index }: GitHubCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const title = item.content?.title || "Draft Issue";
  const itemType = item.type;
  const number = (item.content as any)?.number; // Issue/PR number
  const url = (item.content as any)?.url; // Issue/PR URL
  const repo = (item.content as any)?.repository?.nameWithOwner;
  const assignees = (item.content as any)?.assignees?.nodes;

  // Get common field values (adjust field names like "Status" if different in your project)
  const statusValue = getFieldValue(item, "Status")?.name; // Assuming SingleSelect
  const priorityValue = getFieldValue(item, "Priority")?.name; // Assuming SingleSelect
  // const assigneeField = getFieldValue(item, "Assignees")?.users?.nodes; // If using Assignees field

  const getIcon = () => {
    switch (itemType) {
        case 'ISSUE': return <IssueOpenedIcon className="w-4 h-4 mr-1 text-green-600"/>;
        case 'PULL_REQUEST': return <GitPullRequestIcon className="w-4 h-4 mr-1 text-blue-600"/>;
        case 'DRAFT_ISSUE': return <NoteIcon className="w-4 h-4 mr-1 text-gray-500"/>;
        default: return null;
    }
  }

  return (
    // Adjust Draggable setup if needed, or remove if not draggable
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }}
          className={`rounded-lg border-2 mb-3 bg-card text-card-foreground transition-shadow duration-200 ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''
          } ${isDark ? colors.border.dark : colors.border.light}`}
        >
          <motion.div
            whileHover={{ scale: 1.01 }} // Slightly less intense hover
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div
              className="p-3" // Reduced padding slightly
              // onClick={() => onClick(item.id)} // Add click handler if needed
            >
              <div className="flex items-start justify-between mb-2">
                 <h4 className="text-sm font-semibold leading-tight pr-2" style={{ color: isDark ? colors.text.dark.primary : colors.text.light.primary }}>
                   {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">{title}</a> : title}
                 </h4>
                 {/* Optionally add item ID or other quick info */}
              </div>

              {/* Display repo and number if available */}
              {repo && (
                 <p className="text-xs text-muted-foreground mb-2 truncate">
                   {repo}
                   {number ? `#${number}` : ''}
                </p>
              )}

               {/* Display Status and Priority Badges if they exist */}
                <div className="flex flex-wrap gap-1 my-2">
                    {statusValue && <Badge variant="secondary">{statusValue}</Badge>}
                    {priorityValue && <Badge variant="outline">{priorityValue}</Badge>}
                     {/* Add badges for other important fields */}
                </div>


              <div className="flex items-center justify-between text-xs mt-3">
                 <div className="flex items-center text-muted-foreground">
                    {getIcon()}
                    <span>{itemType.replace('_', ' ').toLowerCase()}</span>
                 </div>
                 {/* Display Assignees */}
                 <AssigneeAvatars assignees={assignees} />
              </div>
            </div>
          </motion.div>
          {/* Removed TimeTracker and Start Work Button - add integrations if needed */}
        </div>
      )}
    </Draggable>
  );
}