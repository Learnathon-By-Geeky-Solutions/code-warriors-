"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { githubService } from '@/services/github/githubService';
import {
    GitHubOrgProject, GitHubProjectItem, GitHubProjectField, GitHubFieldValueNode,
    GitHubFieldOption // Import specific types needed
} from '@/services/github/githubTypes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import GitHubList from '@/components/github/GithubList';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/components/ui/use-toast"; // Make sure useToast is correctly imported

// --- Constants ---
// !!! IMPORTANT: VERIFY this against your GitHub Project Settings -> Fields !!!
const STATUS_FIELD_NAME = "Status";
// Column name for items without a status or if status field isn't found
const DEFAULT_STATUS_COLUMN = "Backlog";

// --- Helper Function ---
const getItemStatusName = (
    item: GitHubProjectItem,
    statusFieldId: string | undefined
): string => {
    if (!statusFieldId) {
        return DEFAULT_STATUS_COLUMN;
    }
    // Find the value for the specific status field ID
    const statusValueNode = item.fieldValues.nodes.find(
        fv => fv.field?.id === statusFieldId && fv.__typename === 'ProjectV2ItemFieldSingleSelectValue'
    );
    // Use the status name if found, otherwise the default
    return (statusValueNode as any)?.name || DEFAULT_STATUS_COLUMN; // Cast needed if using base type
};

// --- Main Component ---
export default function GitHubProjectBoard() {
    const [projects, setProjects] = useState<GitHubOrgProject[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [projectFields, setProjectFields] = useState<GitHubProjectField[]>([]);
    const [items, setItems] = useState<GitHubProjectItem[]>([]);
    const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
    const [loadingItems, setLoadingItems] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast(); // Get toast function

    // --- Data Fetching Callbacks ---
    const fetchProjects = useCallback(async () => {
        // ... (implementation from previous answer - uses githubService.getOrganizationProjects) ...
         setLoadingProjects(true);
        setError(null);
        try {
            const data = await githubService.getOrganizationProjects();
            setProjects(data);
             if (data.length === 0) {
                 console.log("No projects found or PAT lacks permissions.");
            }
        } catch (err: any) {
            console.error("Error fetching GitHub projects:", err);
            setError(`Failed to load GitHub projects: ${err.message}. Check PAT permissions (project, read:org).`);
        } finally {
            setLoadingProjects(false);
        }
    }, []);

    const fetchProjectData = useCallback(async (projectId: string) => {
        // ... (implementation from previous answer - uses githubService.getProjectFields and getProjectItems) ...
        setLoadingItems(true);
        setError(null);
        // Clear previous data before fetching new data
        setItems([]);
        setProjectFields([]);
        try {
            const [fieldsData, itemsData] = await Promise.all([
                githubService.getProjectFields(projectId),
                githubService.getProjectItems(projectId) // Add pagination later
            ]);
             console.log("Fetched Fields:", fieldsData); // Debugging
            const foundStatusField = fieldsData.find(f => f.name?.toLowerCase() === STATUS_FIELD_NAME.toLowerCase());
             console.log("Status Field Found:", foundStatusField); // Debugging

            setProjectFields(fieldsData);
            setItems(itemsData.items);
            console.log("Fetched Items:", itemsData.items); // Debugging: Check item structure and fieldValues

        } catch (err: any) {
            console.error(`Error fetching data for project ${projectId}:`, err);
            setError(`Failed to load project data: ${err.message}`);
            setItems([]); // Clear items on error
            setProjectFields([]); // Clear fields on error
        } finally {
            setLoadingItems(false);
        }
    }, []);

    // --- Effects ---
    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        if (selectedProjectId) {
            fetchProjectData(selectedProjectId);
        } else {
             setItems([]);
             setProjectFields([]);
        }
    }, [selectedProjectId, fetchProjectData]);

    // --- Memoized Calculations ---
    const statusField = useMemo(() => {
         const field = projectFields.find(f => f.name?.toLowerCase() === STATUS_FIELD_NAME.toLowerCase());
        // Only return if it's the correct data type for the mutation/grouping
        return field?.dataType === 'SINGLE_SELECT' ? field : undefined;
    }, [projectFields]);

    const statusOptionsMap = useMemo(() => {
        const map = new Map<string, string>(); // Map status name -> option ID
        // Ensure we are checking the options of the specific field type
        const options = (statusField as Extract<GitHubProjectField, { dataType: 'SINGLE_SELECT' }>)?.options;
        if (options) {
            options.forEach(opt => {
                map.set(opt.name, opt.id);
            });
        }
        return map;
    }, [statusField]);


    const groupedItems = useMemo(() => {
        console.log(`Attempting to group items. Status field found:`, statusField); // Log the identified status field object
        const grouped: Record<string, GitHubProjectItem[]> = {};
        items.forEach(item => {
            // --- Start Debug Logging ---
            const itemTitle = item.content?.title || item.id;
            const statusValueNode = item.fieldValues.nodes.find(
                fv => fv.field?.id === statusField?.id && fv.__typename === 'ProjectV2ItemFieldSingleSelectValue'
            );
            const statusName = (statusValueNode as any)?.name || DEFAULT_STATUS_COLUMN;
    
            console.log(`Item: ${itemTitle} (ID: ${item.id})`);
            console.log(`  - Looking for Field ID: ${statusField?.id}`);
            console.log(`  - Found Status Node:`, statusValueNode); // See the raw node object
            console.log(`  - Extracted Status Name: ${statusName}`);
            // --- End Debug Logging ---
    
            if (!grouped[statusName]) {
                grouped[statusName] = [];
            }
            grouped[statusName].push(item);
        });

        // Ensure columns exist based on field options + default
         const options = (statusField as Extract<GitHubProjectField, { dataType: 'SINGLE_SELECT' }>)?.options;
        if (options) {
             options.forEach(opt => {
                 if (!grouped[opt.name]) grouped[opt.name] = [];
            });
        }
         if (!grouped[DEFAULT_STATUS_COLUMN]) grouped[DEFAULT_STATUS_COLUMN] = [];

         console.log("Final Grouped Items:", grouped);
    return grouped;
    }, [items, statusField]);

    const statusOrder = useMemo(() => {
        const definedStatuses = (statusField as Extract<GitHubProjectField, { dataType: 'SINGLE_SELECT' }>)?.options?.map(opt => opt.name) || [];
        const allGroupKeys = Object.keys(groupedItems);
        // Combine, ensuring defined statuses come first, remove duplicates, add default if missing
        const orderedSet = new Set([...definedStatuses, ...allGroupKeys]);
        // Ensure default column is included if it has items or is the designated default
        if(groupedItems[DEFAULT_STATUS_COLUMN]?.length > 0 || !statusField) {
             orderedSet.add(DEFAULT_STATUS_COLUMN);
        } else {
             orderedSet.delete(DEFAULT_STATUS_COLUMN); // Remove if field exists and group is empty
        }

        const finalOrder = Array.from(orderedSet);
        console.log("Status Order:", finalOrder); // Debugging
        return finalOrder;
    }, [statusField, groupedItems]);


    // --- Event Handlers ---
    const handleProjectChange = (projectId: string) => {
        setSelectedProjectId(projectId === 'none' ? null : projectId);
    };

    const onDragEnd = useCallback(async (result: DropResult) => {
        const { destination, source, draggableId, type } = result;

        // --- Validation ---
        if (!destination || !selectedProjectId || !statusField) {
            console.log("Drag cancelled: No destination, project ID, or status field.");
            return;
        }
        if (destination.droppableId === source.droppableId && destination.index === source.index) {
             console.log("Drag cancelled: Item dropped in the same place.");
            return; // Dropped in the same place
        }
        if (type !== 'github-card') {
             console.log("Drag cancelled: Not a github-card type.");
             return; // Only handle card drags for now
        }

        const destinationStatusName = destination.droppableId; // droppableId is the status name
        const itemId = draggableId; // draggableId is the ProjectV2 Item ID (PVTI_...)

        // --- Find Target Option ID ---
        const targetOptionId = statusOptionsMap.get(destinationStatusName);
        if (!targetOptionId) {
            console.error(`Could not find option ID for status name: ${destinationStatusName}`);
            toast({ title: "Update Failed", description: `Invalid target status column '${destinationStatusName}'. Option ID missing.`, variant: "destructive" });
            return;
        }

         console.log(`Processing drag: Item ${itemId} to Status '${destinationStatusName}' (Option ID: ${targetOptionId}, Field ID: ${statusField.id})`);

        // --- Optimistic UI Update ---
        const itemIndex = items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) {
            console.error("Could not find dragged item in state.");
            return; // Should not happen
        }
        const itemToMove = items[itemIndex];

        // Create the updated field value representation
        const newStatusValueNode: GitHubFieldValueNode = {
             __typename: 'ProjectV2ItemFieldSingleSelectValue', // Set the correct type name
             field: { id: statusField.id, name: statusField.name },
             name: destinationStatusName,
             optionId: targetOptionId
        };

        // Create a new items array with the updated item
        const newItems = items.map((item, index) => {
            if (index === itemIndex) {
                 // Find if the status field already exists for this item
                const existingStatusNodeIndex = item.fieldValues.nodes.findIndex(fv => fv.field?.id === statusField.id);
                const newFieldValuesNodes = [...item.fieldValues.nodes];

                if (existingStatusNodeIndex > -1) {
                    // Update existing status node
                    newFieldValuesNodes[existingStatusNodeIndex] = newStatusValueNode;
                } else {
                    // Add new status node if it didn't exist
                    newFieldValuesNodes.push(newStatusValueNode);
                }
                return { ...item, fieldValues: { nodes: newFieldValuesNodes } };
            }
            return item;
        });
        setItems(newItems); // Update state immediately


        // --- Call GitHub API Mutation ---
        try {
            await githubService.updateItemSingleSelectField(
                selectedProjectId,
                itemId,
                statusField.id,
                targetOptionId
            );

            toast({ title: "Item Status Updated", description: `Moved item to '${destinationStatusName}'.` });
            // Success! Optimistic update is now confirmed. Optionally refetch item details if needed.

        } catch (error: any) {
            console.error("Failed to update item status on GitHub:", error);
            toast({
                title: "Update Failed",
                description: `Could not update on GitHub: ${error.message}. Reverting change.`,
                variant: "destructive"
            });
            // Revert Optimistic Update on failure by refetching all data
            fetchProjectData(selectedProjectId);
        }
    }, [selectedProjectId, statusField, items, statusOptionsMap, fetchProjectData, toast]); // Add dependencies for useCallback


    // --- Render Logic ---
    // ... (keep loading states and error display as before) ...
     if (loadingProjects) return <div className="p-4"><Skeleton className="h-8 w-64 mb-4" /><Skeleton className="h-64 w-full" /></div>;
     if (error && !selectedProjectId) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="p-4 flex flex-col h-full">
            {/* Project Selector */}
            <div className="mb-4 flex-shrink-0">
                 {/* ... Select component as before ... */}
                <Select onValueChange={handleProjectChange} value={selectedProjectId ?? 'none'}>
                     <SelectTrigger className="w-[280px]"><SelectValue placeholder="Select a GitHub Project" /></SelectTrigger>
                     <SelectContent>
                         <SelectItem value="none">-- Select Project --</SelectItem>
                         {projects.map(proj => (<SelectItem key={proj.id} value={proj.id}>{proj.title} (#{proj.number})</SelectItem>))}
                     </SelectContent>
                 </Select>
                {error && selectedProjectId && <p className="text-sm text-red-500 mt-2">{error}</p>}
                {selectedProjectId && !statusField && !loadingItems && items.length > 0 && (
                    <p className="text-sm text-orange-500 mt-2">Warning: Could not find field named '{STATUS_FIELD_NAME}' (Type: Single Select). Grouping by '{DEFAULT_STATUS_COLUMN}'.</p>
                )}
            </div>

             {/* Board Area */}
            {loadingItems && selectedProjectId && ( /* Loading Skeleton */
                <div className="flex gap-4 overflow-x-auto pb-4 flex-grow">/* ... skeletons ... */</div>
            )}

            {!loadingItems && selectedProjectId && ( /* Actual Board */
                <DragDropContext onDragEnd={onDragEnd}>
                     <Droppable droppableId="github-board" type="list" direction="horizontal">
                       {(provided) => (
                         <div ref={provided.innerRef} {...provided.droppableProps} className="flex gap-4 overflow-x-auto pb-4 flex-grow">
                            {statusOrder.map((statusName) => {
                                const listItems = groupedItems[statusName] || [];
                                if (groupedItems.hasOwnProperty(statusName)) {
                                    return <GitHubList key={statusName} listId={statusName} title={statusName} items={listItems} />;
                                }
                                return null;
                            })}
                            {provided.placeholder}
                         </div>
                        )}
                    </Droppable>
                 </DragDropContext>
             )}

            {/* Messages for initial/empty states */}
            {!selectedProjectId && !loadingProjects && projects.length > 0 && ( /* No project selected */
                 <div className="flex items-center justify-center h-full text-muted-foreground flex-grow">Select a project above.</div>
             )}
             {!loadingProjects && projects.length === 0 && !error && ( /* No projects found */
                 <div className="flex items-center justify-center h-full text-muted-foreground flex-grow">No projects found or PAT lacks permissions.</div>
             )}
        </div>
    );
}