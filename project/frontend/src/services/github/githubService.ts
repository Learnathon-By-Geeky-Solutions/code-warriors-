// src/services/github/githubService.ts
import { GitHubOrgProject, GitHubProjectItem, GitHubProjectView, GitHubProjectField,PageInfo, GitHubUpdateItemFieldValueResult } from '@/services/github/githubTypes'; // Adjust import path as needed

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';
// IMPORTANT: Store tokens securely, e.g., in environment variables, NOT hardcoded!
const GITHUB_ORG_PAT = process.env.NEXT_PUBLIC_GITHUB_ORG_PAT; // Replace with env var if possible
const GITHUB_ORG_LOGIN = "phigratio-organization";

async function fetchGitHubGraphQL<T>(query: string, variables: Record<string, any>): Promise<T> {
    if (!GITHUB_ORG_PAT) {
        console.error("GitHub PAT is missing!");
        throw new Error("GitHub PAT is missing!");
    }
    const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GITHUB_ORG_PAT}`,
        },
        body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();

    if (!response.ok || result.errors) {
        console.error('GitHub GraphQL Error:', result.errors || `Status: ${response.status}`);
        // Log specific forbidden errors if present
        if (result.errors?.some((e: any) => e.type === "FORBIDDEN")) {
            console.error("Potential permission issue with the GitHub PAT. Check its scopes (project, read:org).");
        }
        throw new Error(`GitHub GraphQL query failed: ${JSON.stringify(result.errors) || response.statusText}`);
    }

    return result.data;
}

// --- Query Definitions ---

const GET_ORG_PROJECTS_QUERY = `
query GetOrgProjects($ownerLogin: String!, $numProjects: Int = 10) {
  organization(login: $ownerLogin) {
    login
    projectsV2(first: $numProjects) {
      totalCount
      nodes {
        id
        title
        number
        url
        readme
        createdAt
        closed
        public
        owner { id ... on Organization { login } }
        creator { login }
      }
      pageInfo { endCursor hasNextPage }
    }
  }
}
`;

const GET_PROJECT_VIEWS_QUERY = `
query GetProjectViews($projectId: ID!, $numViews: Int = 10) {
  node(id: $projectId) {
    ... on ProjectV2 {
      id
      title
      views(first: $numViews) {
        totalCount
        nodes {
          id
          name
          layout
        }
        pageInfo { endCursor hasNextPage }
      }
    }
  }
}
`;

const GET_PROJECT_ITEMS_WITH_FIELDS_QUERY = `
query GetProjectItemsWithFields(
  $projectId: ID!, $numItems: Int = 50, $numFieldsPerItem: Int = 15, $numAssigneesPerItem: Int = 5, $afterCursor: String = null
) {
  node(id: $projectId) {
    ... on ProjectV2 {
      id
      title
      items(first: $numItems, after: $afterCursor, orderBy: {field: POSITION, direction: ASC}) {
        totalCount
        nodes {
          id
          type
          createdAt
          updatedAt
          isArchived
          content {
            ... on DraftIssue { id title body assignees(first: $numAssigneesPerItem) { nodes { login id } } }
            ... on Issue { id title number url state assignees(first: $numAssigneesPerItem) { nodes { login id } } repository { nameWithOwner } }
            ... on PullRequest { id title number url state assignees(first: $numAssigneesPerItem) { nodes { login id } } repository { nameWithOwner } }
          }
          fieldValues(first: $numFieldsPerItem) {
            nodes {
              ... on ProjectV2ItemFieldValueCommon {
                field { ... on ProjectV2FieldCommon { id name } }
              }
              ... on ProjectV2ItemFieldTextValue { text }
              ... on ProjectV2ItemFieldNumberValue { number }
              ... on ProjectV2ItemFieldDateValue { date }
              ... on ProjectV2ItemFieldSingleSelectValue { name optionId }
              ... on ProjectV2ItemFieldIterationValue { id title startDate duration }
              ... on ProjectV2ItemFieldUserValue { users(first: $numAssigneesPerItem) { nodes { login id } } }
              # Add other types if needed
            }
            pageInfo { hasNextPage endCursor }
          }
        }
        pageInfo { endCursor hasNextPage }
      }
    }
  }
}
`;


// --- ADD THIS MUTATION DEFINITION ---
const UPDATE_ITEM_SINGLE_SELECT_FIELD_MUTATION = `
    mutation UpdateProjectV2ItemFieldValue(
        $projectId: ID!,
        $itemId: ID!,
        $fieldId: ID!,
        $optionId: String!
    ) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: {
            singleSelectOptionId: $optionId
          }
        }
      ) {
        clientMutationId
        projectV2Item { # <<< CHANGED 'item' to 'projectV2Item'
          id
        }
      }
    }
`;


const GET_PROJECT_FIELDS_QUERY = `
query GetProjectFields($projectId: ID!, $numFields: Int = 20) {
  node(id: $projectId) {
    ... on ProjectV2 {
      id
      title
      fields(first: $numFields) {
        totalCount
        nodes {
          ... on ProjectV2FieldCommon { id name dataType }
          ... on ProjectV2SingleSelectField { options { id name } }
          ... on ProjectV2IterationField { configuration { iterations { id title startDate duration } completedIterations { id title } } }
          # Add other field types if needed
        }
        pageInfo { endCursor hasNextPage }
      }
    }
  }
}
`;


// --- Service Functions ---

export const githubService = {
    async getOrganizationProjects(): Promise<GitHubOrgProject[]> {
        const data = await fetchGitHubGraphQL<{ organization: { projectsV2: { nodes: GitHubOrgProject[] } } }>(
            GET_ORG_PROJECTS_QUERY,
            { ownerLogin: GITHUB_ORG_LOGIN, numProjects: 20 } // Fetch more projects if needed
        );
        return data.organization.projectsV2.nodes.filter(p => p !== null); // Filter out potential nulls from permission errors
    },
   

    async getProjectViews(projectId: string): Promise<GitHubProjectView[]> {
         const data = await fetchGitHubGraphQL<{ node: { views: { nodes: GitHubProjectView[] } } }>(
            GET_PROJECT_VIEWS_QUERY,
            { projectId, numViews: 20 }
        );
        return data.node.views.nodes;
    },

    async getProjectItems(projectId: string, afterCursor: string | null = null): Promise<{ items: GitHubProjectItem[], pageInfo: PageInfo }> {
      // Ensure query requests necessary fields like isArchived
      const data = await fetchGitHubGraphQL<{ node: { items: { nodes: GitHubProjectItem[], totalCount: number, pageInfo: PageInfo } } }>(
         GET_PROJECT_ITEMS_WITH_FIELDS_QUERY,
         { projectId, numItems: 50, afterCursor }
     );
     const items = data.node?.items?.nodes?.filter((item): item is GitHubProjectItem => item !== null && !item.isArchived) ?? [];
     const pageInfo = data.node?.items?.pageInfo ?? { endCursor: null, hasNextPage: false };
     return { items, pageInfo };
 },
 async updateItemSingleSelectField(
  projectId: string,
  itemId: string,
  fieldId: string,
  optionId: string
// The return type annotation needs to change too (see step 2)
): Promise<GitHubUpdateItemFieldValueResult | null> {
  console.log("Sending update to GitHub:", { projectId, itemId, fieldId, optionId });
  try {
      // The fetch call itself remains the same, but the expected response shape changes
      const data = await fetchGitHubGraphQL<GitHubUpdateItemFieldValueResult>(
          UPDATE_ITEM_SINGLE_SELECT_FIELD_MUTATION,
          { projectId, itemId, fieldId, optionId }
      );
      return data;
  } catch (error) {
      console.error("Mutation failed in service:", error);
      throw error;
  }
},

     async getProjectFields(projectId: string): Promise<GitHubProjectField[]> {
         const data = await fetchGitHubGraphQL<{ node: { fields: { nodes: GitHubProjectField[] } } }>(
             GET_PROJECT_FIELDS_QUERY,
             { projectId, numFields: 30 }
         );
        return data.node.fields.nodes;
    }
};