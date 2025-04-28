// src/services/boardService.ts
import { privateAxios } from "@/services/axiosConfig";

import { BoardList } from "./listService";
import { Card } from "./cardService";

// Types and Interfaces
export interface Board {
  id: string;
  title: string;
  image: string;
  teamId: string;
  lists?: BoardList[];
  cards?: Card[];
}

export interface CreateBoardData {
  title: string;
  image: string;
  teamId: string;
  lists?: BoardList[];
  cards?: Card[];
}

export const boardService = {
  getAllBoards: async (): Promise<Board[]> => {
    const response = await privateAxios.get("/pm/v1/boards");
    return response.data;
  },

  getBoardsByTeamId: async (teamId: string): Promise<Board[]> => {
    const response = await privateAxios.get(`/pm/v1/boards/team/${teamId}`);
    return response.data;
  },

  createBoard: async (boardData: CreateBoardData): Promise<Board> => {
    const response = await privateAxios.post("/pm/v1/boards", boardData);
    return response.data;
  },

  getBoardById: async (id: string): Promise<Board> => {
    const response = await privateAxios.get(`/pm/v1/boards/${id}`);
    return response.data;
  },

  deleteBoard: async (id: string): Promise<void> => {
    await privateAxios.delete(`/pm/v1/boards/${id}`);
  },
};
