import React, { useEffect, useState } from "react";
import {
  ToggleLeft,
  ToggleRight,
  Eye,
  Activity,
  Monitor,
  EyeOff,
  Camera,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrackingStatus,
  trackingStatusService,
} from "@/services/tracking/trackingStatusService";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import WebcamCaptureCard from "./WebcamCaptureCard";

const TrackingControls = () => {
  const { toast } = useToast();
  const [trackingExists, setTrackingExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showWebcamDialog, setShowWebcamDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: string;
    action: () => Promise<TrackingStatus | void>;
  } | null>(null);

  const [trackingStatus, setTrackingStatus] = useState({
    faceTrackingStatus: false,
    canOfficeSeeFaceTracking: false,
    activityTrackingStatus: false,
    canOfficeSeeActivityTracking: false,
    screenTrackingStatus: false,
    canOfficeSeeScreenTracking: false,
  });

  const checkAndLoadTrackingStatus = async () => {
    try {
      setLoading(true);
      const exists = await trackingStatusService.checkTrackingInfoExists();
      setTrackingExists(exists);

      if (exists) {
        const status = await trackingStatusService.getTrackingStatus();
        setTrackingStatus({
          faceTrackingStatus: status.faceTrackingStatus,
          canOfficeSeeFaceTracking: status.canOfficeSeeFaceTracking,
          activityTrackingStatus: status.activityTrackingStatus,
          canOfficeSeeActivityTracking: status.canOfficeSeeActivityTracking,
          screenTrackingStatus: status.screenTrackingStatus,
          canOfficeSeeScreenTracking: status.canOfficeSeeScreenTracking,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tracking status",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAndLoadTrackingStatus();
  }, []);

  const handleEnableTracking = async () => {
    try {
      await trackingStatusService.createTrackingInfo();
      toast({
        title: "Success",
        description: "Tracking has been enabled",
      });
      await checkAndLoadTrackingStatus();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to enable tracking",
      });
    }
  };

  const confirmToggle = (
    type: string,
    action: () => Promise<TrackingStatus | void>
  ) => {
    setPendingAction({ type, action });
    setShowDialog(true);
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;

    try {
      await pendingAction.action();
      await checkAndLoadTrackingStatus();
      toast({
        title: "Success",
        description: `${pendingAction.type} setting updated successfully`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update ${pendingAction.type.toLowerCase()} setting`,
      });
    } finally {
      setShowDialog(false);
      setPendingAction(null);
    }
  };

  const ToggleButton = ({
    isActive,
    canOfficeSee,
    icon: Icon,
    label,
    onToggleTracking,
    onToggleVisibility,
  }: {
    isActive: boolean;
    canOfficeSee: boolean;
    icon: React.ElementType;
    label: string;
    onToggleTracking: () => void;
    onToggleVisibility: () => void;
  }) => (
    <div className="flex flex-col gap-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon
            size={20}
            className={isActive ? "text-green-500" : "text-gray-400"}
          />
          <span className="font-medium">{label}</span>
        </div>
        <button
          onClick={onToggleTracking}
          className="focus:outline-none"
          aria-label={`Toggle ${label}`}
        >
          {isActive ? (
            <ToggleRight className="w-10 h-10 text-green-500" />
          ) : (
            <ToggleLeft className="w-10 h-10 text-gray-400" />
          )}
        </button>
      </div>

      {isActive && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {canOfficeSee ? <Eye size={16} /> : <EyeOff size={16} />}
            <span className="text-sm">Office Visibility</span>
          </div>
          <button
            onClick={onToggleVisibility}
            className="focus:outline-none"
            aria-label={`Toggle ${label} visibility`}
          >
            {canOfficeSee ? (
              <ToggleRight className="w-8 h-8 text-blue-500" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-gray-400" />
            )}
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (!trackingExists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enable Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Tracking is currently disabled. Enable it to start monitoring.
          </p>
          <Button onClick={handleEnableTracking}>Enable Tracking</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor size={24} /> Tracking Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <ToggleButton
                isActive={trackingStatus.faceTrackingStatus}
                canOfficeSee={trackingStatus.canOfficeSeeFaceTracking}
                icon={Eye}
                label="Face Tracking"
                onToggleTracking={() =>
                  confirmToggle(
                    "Face Tracking",
                    trackingStatusService.changeFaceTrackingStatus
                  )
                }
                onToggleVisibility={() =>
                  confirmToggle(
                    "Face Tracking Visibility",
                    trackingStatusService.changeCanOfficeSeeScreenTracking
                  )
                }
              />

              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => setShowWebcamDialog(true)}
              >
                <Camera size={16} />
                Take Reference Photo
              </Button>
            </div>

            <ToggleButton
              isActive={trackingStatus.activityTrackingStatus}
              canOfficeSee={trackingStatus.canOfficeSeeActivityTracking}
              icon={Activity}
              label="Activity Tracking"
              onToggleTracking={() =>
                confirmToggle(
                  "Activity Tracking",
                  trackingStatusService.changeActivityTrackingStatus
                )
              }
              onToggleVisibility={() =>
                confirmToggle(
                  "Activity Tracking Visibility",
                  trackingStatusService.changeCanOfficeSeeActivityTracking
                )
              }
            />

            <ToggleButton
              isActive={trackingStatus.screenTrackingStatus}
              canOfficeSee={trackingStatus.canOfficeSeeScreenTracking}
              icon={Monitor}
              label="Screen Tracking"
              onToggleTracking={() =>
                confirmToggle(
                  "Screen Tracking",
                  trackingStatusService.changeScreenTrackingStatus
                )
              }
              onToggleVisibility={() =>
                confirmToggle(
                  "Screen Tracking Visibility",
                  trackingStatusService.changeCanOfficeSeeScreenTracking
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Existing Alert Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change this{" "}
              {pendingAction?.type.toLowerCase()} setting?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDialog(false);
                setPendingAction(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Dialog for WebcamCaptureCard */}
      <Dialog open={showWebcamDialog} onOpenChange={setShowWebcamDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Take Reference Photo</DialogTitle>
          </DialogHeader>
          <WebcamCaptureCard />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrackingControls;
