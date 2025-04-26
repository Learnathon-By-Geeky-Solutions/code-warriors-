// src/services/listService.ts

import { privateAxios } from "@/services/axiosConfig";
import { Card } from "./cardService";

export interface BoardList {
  id: string;
  title: string;
  boardId: string;
  order: number;
  cards?: Card[];
}

export interface CreateListData {
  title: string;
  boardId: string;
}

export interface UpdateListData {
  title: string;
  boardId: string;
}

export const listService = {
  getLists: async (boardId: string): Promise<BoardList[]> => {
    const response = await privateAxios.get(`/pm/v1/lists/board/${boardId}`);
    return response.data;
  },

  createList: async (data: CreateListData): Promise<BoardList> => {
    const response = await privateAxios.post("/pm/v1/lists", data);
    return response.data;
  },

  updateList: async (id: string, data: UpdateListData): Promise<BoardList> => {
    const response = await privateAxios.put(`/pm/v1/lists/${id}`, data);
    return response.data;
  },

  deleteList: async (id: string): Promise<void> => {
    await privateAxios.delete(`/pm/v1/lists/${id}`);
  },

  reorderLists: async (lists: BoardList[]): Promise<void> => {
    await privateAxios.put("/pm/v1/lists/reorder", lists);
  },

  getCardCount: async (listId: string): Promise<number> => {
    const response = await privateAxios.get(`/pm/v1/lists/${listId}/length`);
    return response.data.length;
  },
};
