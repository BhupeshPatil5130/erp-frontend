"use client";

import { useEffect, useState } from "react";
import { Bell, Menu } from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/components/sidebar-provider";
import UserProfileMenu from "@/components/user-profile-menu";
import { useToast } from "@/hooks/use-toast";

export function MainHeader() {
  const { isOpen, setIsOpen } = useSidebar();
  const { toast } = useToast();

  const [notificationCount, setNotificationCount] = useState(3);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [imageError, setImageError] = useState(false);   // 👈 new

  /* fetch user once */
  useEffect(() => {
    axios
      .get( "http://localhost:4000/api/profile", { withCredentials: true })
      .then((res) => {
        setUserName(res.data.name);
        setUserRole(res.data.role || "User");
        setPhotoUrl(res.data.photoUrl || "");
      })
      .catch((err) => console.error("Failed to fetch user info", err));
  }, []);

  /* notification click */
  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have 3 unread notifications",
    });
    setNotificationCount(0);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div className="flex-1" />

      {/* right-hand controls */}
      <div className="flex items-center gap-4">
        {/* bell */}
        <div className="relative">
          <Button variant="ghost" size="icon" onClick={handleNotificationClick}>
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {notificationCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </div>

        {/* avatar (picture OR initials) */}
        <Avatar className="h-9 w-9">
          {photoUrl && !imageError ? (
            <AvatarImage
              src={photoUrl}
              alt={userName}
              onError={() => setImageError(true)}
            />
          ) : (
            <AvatarFallback className="uppercase">
              {userName.slice(0, 2)}
            </AvatarFallback>
          )}
        </Avatar>

        {/* dropdown */}
        <UserProfileMenu
          userName={userName}
          userRole={userRole}
          photoUrl={photoUrl && !imageError ? photoUrl : undefined}
        />
      </div>
    </header>
  );
}
