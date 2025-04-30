// src/components/BoardTitle.tsx
import React from "react";
import { useRouter } from "next/navigation";
import { Board } from "@/services/project/boardService";

interface BoardTitleProps {
  board: Board;
  officeId: string;
  teamId: string;
}

const BoardTitle: React.FC<BoardTitleProps> = ({ board, officeId, teamId }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/office/${officeId}/team/${teamId}/board/${board.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="p-2 mb-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
    >
      <h3 className="text-sm font-medium truncate">{board.title}</h3>
    </div>
  );
};

export default BoardTitle;
