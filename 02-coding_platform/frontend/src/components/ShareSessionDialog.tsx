import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { copyToClipboard } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ShareSessionDialogProps {
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareSessionDialog = ({ sessionId, open, onOpenChange }: ShareSessionDialogProps) => {
  const { toast } = useToast();

  const sessionLink = useMemo(() => `${window.location.origin}/interview/${sessionId}`, [sessionId]);
  const shareMessage = useMemo(
    () =>
      `Join my coding interview session!\n\nSession ID: ${sessionId}\nLink: ${sessionLink}\n\nOpen the link to join.`,
    [sessionId, sessionLink]
  );

  const handleCopy = async (value: string, label: string) => {
    const ok = await copyToClipboard(value);
    toast({
      title: ok ? `${label} copied!` : `Failed to copy ${label.toLowerCase()}`,
      description: ok ? undefined : "Please try again.",
      variant: ok ? "default" : "destructive"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Session</DialogTitle>
          <DialogDescription>Send this link or message to invite others to the interview session.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Session Link</label>
            <div className="flex gap-2">
              <Input value={sessionLink} readOnly />
              <Button type="button" onClick={() => handleCopy(sessionLink, "Link")}>
                Copy Link
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Share Message</label>
            <Textarea value={shareMessage} readOnly className="min-h-[120px]" />
            <div className="flex justify-end">
              <Button type="button" onClick={() => handleCopy(shareMessage, "Message")}>
                Copy Message
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
