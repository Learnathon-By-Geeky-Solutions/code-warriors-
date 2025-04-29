// app/office/[id]/team/[teamId]/MeetingSidebar.tsx
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  meetingService,
  Meeting,
  CreateMeetingData,
} from "@/services/office/meetingService";
import { format } from "date-fns";

interface MeetingSidebarProps {
  isOpen: boolean;
}

const MeetingTitle = ({
  meeting,
  officeId,
  teamId,
}: {
  meeting: Meeting;
  officeId: string;
  teamId: string;
}) => {
  const router = useRouter();

  const handleMeetingClick = () => {
    router.push(`/office/${officeId}/team/${teamId}/meet/${meeting.id}`);
  };

  return (
    <div className={styles.meetingCard} onClick={handleMeetingClick}>
      <h3 className={styles.meetingTitle}>{meeting.title}</h3>
      <p className={styles.meetingDate}>
        {format(new Date(meeting.meetingDate), "MMM dd, yyyy")}
      </p>
    </div>
  );
};

export default function MeetingSidebar({ isOpen }: MeetingSidebarProps) {
  const { theme } = useTheme();
  const params = useParams();
  const officeId = params.id as string;
  const teamId = params.teamId as string;

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(true);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState<CreateMeetingData>({
    teamId,
    title: "",
    description: "",
    meetingDate: new Date().toISOString(),
    summary: "",
  });

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const data = await meetingService.getMeetingsByTeamId(teamId);
        setMeetings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setMeetingsLoading(false);
      }
    };

    fetchMeetings();
  }, [teamId]);

  const handleCreateMeeting = async () => {
    try {
      const createdMeeting = await meetingService.createMeeting(newMeeting);
      setMeetings((prevMeetings) => [...prevMeetings, createdMeeting]);

      // Reset form
      setNewMeeting({
        teamId,
        title: "",
        description: "",
        meetingDate: new Date().toISOString(),
        summary: "",
      });
      setIsAddMeetingOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create meeting.");
    }
  };

  return (
    <div
      className={`${styles.sidebar} ${styles.meetSidebar} ${
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
          Team Meetings
        </h2>
      </div>
      <div className={styles.meetingList}>
        {meetingsLoading ? (
          <p>Loading meetings...</p>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <MeetingTitle
                key={meeting.id}
                meeting={meeting}
                officeId={officeId}
                teamId={teamId}
              />
            ))}

            <Dialog open={isAddMeetingOpen} onOpenChange={setIsAddMeetingOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mt-4" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Meeting
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
                  <DialogTitle>Schedule New Meeting</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Meeting Title"
                    value={newMeeting.title}
                    onChange={(e) =>
                      setNewMeeting((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
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
                  <Input
                    placeholder="Description"
                    value={newMeeting.description}
                    onChange={(e) =>
                      setNewMeeting((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
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
                  <Input
                    type="datetime-local"
                    value={new Date(newMeeting.meetingDate)
                      .toISOString()
                      .slice(0, 16)}
                    onChange={(e) =>
                      setNewMeeting((prev) => ({
                        ...prev,
                        meetingDate: new Date(e.target.value).toISOString(),
                      }))
                    }
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
                  <Button
                    className="w-full"
                    onClick={handleCreateMeeting}
                    disabled={!newMeeting.title}
                  >
                    Schedule Meeting
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
