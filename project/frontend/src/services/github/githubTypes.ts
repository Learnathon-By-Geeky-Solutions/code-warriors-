// src/services/github/githubTypes.ts

// --- Basic Types ---
export interface GitHubUser {
  login: string;
  id?: string;
}

export interface GitHubRepository {
  nameWithOwner: string;
}

export interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
}

// --- Project Type ---
export interface GitHubProject {
  id: string;
  title: string;
  number: number;
  url: string;
  readme: string | null;
  createdAt: string;
  closed: boolean;
  public: boolean;
  owner: { id: string; login: string };
  creator: GitHubUser | null;
}
export type GitHubOrgProject = GitHubProject; // Alias for clarity

// --- Project View Type ---
export interface GitHubProjectView {
  id: string;
  name: string;
  layout: 'BOARD_LAYOUT' | 'TABLE_LAYOUT' | 'ROADMAP_LAYOUT'; // Add others if needed
}

// --- Field Definition Types ---

// Represents an option in a Single Select field
export interface GitHubFieldOption {
  id: string; // Option ID (PVTSO_... or just hex like f75ad846)
  name: string; // Option display name (e.g., "Todo", "In Progress")
}

// Represents an iteration in an Iteration field
export interface GitHubIteration {
  id: string; // Iteration ID (e.g., cfc16e4d)
  title: string;
  startDate: string;
  duration: number; // in days
}

// Base interface for common field properties
interface GitHubProjectFieldCommon {
   id: string; // Field ID (PVT...)
   name: string; // Field display name (e.g., "Status", "Assignees")
   dataType: 'TEXT' | 'NUMBER' | 'DATE' | 'SINGLE_SELECT' | 'ITERATION' | 'USER' | 'LABELS' | string; // Add other known types or keep string as fallback
}

// Specific type for Single Select fields (adding options)
export interface GitHubProjectSingleSelectField extends GitHubProjectFieldCommon {
  dataType: 'SINGLE_SELECT';
  options?: GitHubFieldOption[]; // Array of possible options
}

// Specific type for Iteration fields (adding configuration)
export interface GitHubProjectIterationField extends GitHubProjectFieldCommon {
   dataType: 'ITERATION';
   configuration?: {
      iterations: GitHubIteration[];
      completedIterations: GitHubIteration[];
   }
}

// Union type for all possible project fields
export type GitHubProjectField =
  | GitHubProjectFieldCommon // Base case
  | GitHubProjectSingleSelectField
  | GitHubProjectIterationField;
  // Add other specific field types here if needed

// --- Item and Field Value Types ---

// Base interface for item content
interface GitHubItemContentBase {
  id: string; // Underlying Issue/PR/Draft ID
  title: string;
}

// Specific content types
export interface GitHubIssueContent extends GitHubItemContentBase {
  __typename: 'Issue';
  number: number;
  url: string;
  state: 'OPEN' | 'CLOSED';
  assignees: { nodes: GitHubUser[] };
  repository: GitHubRepository;
}

export interface GitHubPullRequestContent extends GitHubItemContentBase {
  __typename: 'PullRequest';
  number: number;
  url: string;
  state: 'OPEN' | 'CLOSED' | 'MERGED';
  assignees: { nodes: GitHubUser[] };
  repository: GitHubRepository;
}

export interface GitHubDraftIssueContent extends GitHubItemContentBase {
   __typename: 'DraftIssue';
   body: string | null;
   assignees: { nodes: GitHubUser[] };
}

// Union type for item content
export type GitHubItemContent = GitHubIssueContent | GitHubPullRequestContent | GitHubDraftIssueContent | null;


// Base interface for a field *value* attached to an item
interface GitHubFieldValueCommon {
  __typename: string; // e.g., "ProjectV2ItemFieldTextValue", "ProjectV2ItemFieldSingleSelectValue"
  field: { // Reference back to the field definition
      id: string;
      name: string;
  };
}

// Specific types for different field *values*
export interface GitHubFieldValueText extends GitHubFieldValueCommon { __typename: 'ProjectV2ItemFieldTextValue'; text?: string; }
export interface GitHubFieldValueNumber extends GitHubFieldValueCommon { __typename: 'ProjectV2ItemFieldNumberValue'; number?: number; }
export interface GitHubFieldValueDate extends GitHubFieldValueCommon { __typename: 'ProjectV2ItemFieldDateValue'; date?: string; }
export interface GitHubFieldValueSingleSelect extends GitHubFieldValueCommon {
  __typename: 'ProjectV2ItemFieldSingleSelectValue';
  name?: string; // The selected option's name
  optionId?: string; // The selected option's ID (PVTSO_... or hex)
}
export interface GitHubFieldValueIteration extends GitHubFieldValueCommon {
   __typename: 'ProjectV2ItemFieldIterationValue';
   id?: string;
   title?: string;
   startDate?: string;
   duration?: number;
}
export interface GitHubFieldValueUser extends GitHubFieldValueCommon { __typename: 'ProjectV2ItemFieldUserValue'; users?: { nodes: GitHubUser[] }; }

// Union type for any field value node
export type GitHubFieldValueNode =
  | GitHubFieldValueText | GitHubFieldValueNumber | GitHubFieldValueDate
  | GitHubFieldValueSingleSelect | GitHubFieldValueIteration | GitHubFieldValueUser;
  // Add others

// --- Project Item Type ---
export interface GitHubProjectItem {
  id: string; // Item node ID (PVTI_...)
  type: 'ISSUE' | 'PULL_REQUEST' | 'DRAFT_ISSUE';
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  content: GitHubItemContent;
  fieldValues: {
      nodes: GitHubFieldValueNode[];
      pageInfo?: PageInfo;
  };
}

// --- Mutation Result Type ---
export interface GitHubUpdateItemFieldValueResult {
  updateProjectV2ItemFieldValue: {
      clientMutationId: string | null;
      item: {
          id: string;
      };
  } | null;
}