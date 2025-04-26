import { privateAxios } from "@/services/axiosConfig";

export interface AssignedTask {
  id: number;
  userId: string;
  officeId: string;
  cardId: string;
  taskStatus: number;
  createdAt?: string;
}

export const assignedTaskService = {
  /**
   * Creates a new assigned task.
   *
   * @param taskData Task data to be created
   * @returns The created AssignedTask object
   */
  createTask: async (
    taskData: Partial<AssignedTask>
  ): Promise<AssignedTask> => {
    try {
      const response = await privateAxios.post<AssignedTask>(
        "/ac/v1/task",
        taskData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  /**
   * Updates the status of a specific task.
   *
   * @param taskId ID of the task to update
   * @param newStatus New status to set for the task
   * @returns The updated AssignedTask object
   */
  updateTaskStatus: async (
    taskId: number,
    newStatus: number
  ): Promise<AssignedTask> => {
    try {
      const response = await privateAxios.put<AssignedTask>(
        `/ac/v1/task/${taskId}/status`,
        null,
        {
          params: { status: newStatus },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating task status:", error);
      throw error;
    }
  },

  /**
   * Retrieves a specific task by its ID.
   *
   * @param taskId ID of the task to retrieve
   * @returns The AssignedTask object
   */
  getTaskById: async (taskId: number): Promise<AssignedTask> => {
    try {
      const response = await privateAxios.get<AssignedTask>(
        `/ac/v1/task/${taskId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting task by ID:", error);
      throw error;
    }
  },

  /**
   * Retrieves all tasks.
   *
   * @returns List of all AssignedTask objects
   */
  getAllTasks: async (): Promise<AssignedTask[]> => {
    try {
      const response = await privateAxios.get<AssignedTask[]>("/ac/v1/task");
      return response.data;
    } catch (error) {
      console.error("Error getting all tasks:", error);
      throw error;
    }
  },

  /**
   * Retrieves completed tasks for a specific day.
   *
   * @param day The day to retrieve completed tasks for
   * @returns List of completed AssignedTask objects
   */
  getCompletedTasksByDay: async (day: string): Promise<AssignedTask[]> => {
    try {
      const response = await privateAxios.get<AssignedTask[]>(
        "/ac/v1/task/completed/day",
        {
          params: { day },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting completed tasks by day:", error);
      throw error;
    }
  },

  /**
   * Retrieves completed tasks for a specific week.
   *
   * @param weekStart The start of the week to retrieve completed tasks for
   * @returns List of completed AssignedTask objects
   */
  getCompletedTasksByWeek: async (
    weekStart: string
  ): Promise<AssignedTask[]> => {
    try {
      const response = await privateAxios.get<AssignedTask[]>(
        "/ac/v1/task/completed/week",
        {
          params: { weekStart },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting completed tasks by week:", error);
      throw error;
    }
  },
};
