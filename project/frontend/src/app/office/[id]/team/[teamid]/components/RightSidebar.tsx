import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { colors } from "@/components/colors";
import styles from "../TeamPage.module.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import BoardTitle from "@/components/BoardTitle";
import { boardService, Board } from "@/services/project/boardService";

interface RightSidebarProps {
  isOpen: boolean;
}

export default function RightSidebar({ isOpen }: RightSidebarProps) {
  const { theme } = useTheme();
  const params = useParams();
  const officeId = params.id as string;
  const teamId = params.teamId as string;

  const [boards, setBoards] = useState<Board[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(true);
  const [isAddBoardOpen, setIsAddBoardOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await boardService.getBoardsByTeamId(teamId);
        setBoards(data);
      } catch (err) {
        console.error(err);
      } finally {
        setBoardsLoading(false);
      }
    };

    fetchBoards();
  }, [teamId]);

  const handleCreateBoard = async () => {
    try {
      const newBoard = await boardService.createBoard({
        title: newBoardTitle,
        teamId,
        image: "",
        lists: [],
        cards: [],
      });
      setBoards((prevBoards) => [...prevBoards, newBoard]);
      setNewBoardTitle("");
      setIsAddBoardOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create board.");
    }
  };

  return (
    <div
      className={`${styles.sidebar} ${styles.rightSidebar} ${
        isOpen ? styles.open : ""
      }`}
      style={{
        backgroundColor:
          theme === "dark"
            ? colors.background.dark.end
            : colors.background.light.end,
      }}
    >
      <div className={styles.sidebarHeader}>
        <h2
          className={styles.sidebarTitle}
          style={{
            color:
              theme === "dark"
                ? colors.text.dark.primary
                : colors.text.light.primary,
          }}
        >
          Project Management
        </h2>
      </div>
      <div className={styles.boardList}>
        {boardsLoading ? (
          <p>Loading boards...</p>
        ) : (
          <div className="space-y-4">
            {boards.map((board) => (
              <BoardTitle
                key={board.id}
                board={board}
                officeId={officeId}
                teamId={teamId}
              />
            ))}

            <Dialog open={isAddBoardOpen} onOpenChange={setIsAddBoardOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mt-4" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Board
                </Button>
              </DialogTrigger>
              <DialogContent
                style={{
                  backgroundColor:
                    theme === "dark"
                      ? colors.background.dark.start
                      : colors.background.light.start,
                  color:
                    theme === "dark"
                      ? colors.text.dark.primary
                      : colors.text.light.primary,
                }}
              >
                <DialogHeader>
                  <DialogTitle>Create New Board</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder="Board Title"
                      value={newBoardTitle}
                      onChange={(e) => setNewBoardTitle(e.target.value)}
                      style={{
                        backgroundColor:
                          theme === "dark"
                            ? colors.background.dark.start
                            : colors.background.light.start,
                        color:
                          theme === "dark"
                            ? colors.text.dark.primary
                            : colors.text.light.primary,
                      }}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleCreateBoard}
                    disabled={!newBoardTitle}
                  >
                    Create Board
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
