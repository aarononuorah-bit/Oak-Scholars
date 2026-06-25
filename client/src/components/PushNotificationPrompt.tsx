import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function PushNotificationPrompt() {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) return null;

  return (
    <div className="rounded-xl border border-amber/30 bg-amber/5 p-4 flex items-start gap-3">
      <Bell className="text-amber mt-0.5 flex-shrink-0" size={20} />
      <div className="flex-1">
        <p className="font-semibold text-navy-deep text-sm">Session Reminders</p>
        <p className="text-muted-brand text-xs mt-0.5">
          {isSubscribed
            ? "You're receiving push notifications for session reminders."
            : "Enable push notifications to get reminders about your upcoming sessions."}
        </p>
      </div>
      <Button
        size="sm"
        variant={isSubscribed ? "outline" : "default"}
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={isLoading}
        className="flex-shrink-0 text-xs"
        style={!isSubscribed ? { backgroundColor: "#E8A838", color: "#281A39" } : {}}
      >
        {isLoading ? "..." : isSubscribed ? (
          <><BellOff size={14} className="mr-1" />Disable</>
        ) : (
          <><Bell size={14} className="mr-1" />Enable</>
        )}
      </Button>
    </div>
  );
}
