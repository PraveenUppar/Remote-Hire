import { useState } from "react";
// Import the necessary components from Shadcen
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
// Import the useMeetingActions hook to handle meeting actions
import useMeetingActions from "@/hooks/useMeetingActions";

// Define the props for the MeetingModal component
interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isJoinMeeting: boolean;
}

// MeetingModal component to handle the meeting creation and joining
function MeetingModal({ isOpen, onClose, title, isJoinMeeting }: MeetingModalProps) {
  // State to manage the meeting URL input
  const [meetingUrl, setMeetingUrl] = useState("");
  // Import the useMeetingActions hook to handle meeting actions
  const { createInstantMeeting, joinMeeting } = useMeetingActions();

  // Function to handle the start of the meeting
  const handleStart = () => {
    // Check if the meeting URL is a valid URL
    // Join the metting using the meeting URL
    if (isJoinMeeting) {
      // if it's a full URL extract meeting ID
      const meetingId = meetingUrl.split("/").pop();
      if (meetingId) joinMeeting(meetingId);
    } else {
      createInstantMeeting();
    }

    setMeetingUrl("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {/* Join metting using URL */}
        <div className="space-y-4 pt-4">
          {isJoinMeeting && (
            <Input
              placeholder="Paste meeting link here..."
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
            />
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleStart} disabled={isJoinMeeting && !meetingUrl.trim()}>
              {isJoinMeeting ? "Join Meeting" : "Start Meeting"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default MeetingModal;
