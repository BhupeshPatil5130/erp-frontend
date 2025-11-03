"use client";

import { useEffect, useState } from "react";
import { Bell, Menu, UserCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

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
  const [imageError, setImageError] = useState(false);
  const [institute, setInstitute] = useState<string>("");
  const [logoPath, setLogoPath] = useState<string>("/placeholder-logo.png");
  const [logoError, setLogoError] = useState(false);

  const getInstituteLogo = (value: string): string => {
    const normalized = (value || "").toLowerCase().replace(/\s+/g, "");
    const map: Record<string, string> = {
      playgroup: "/logos/playgroup-logo.png",
      nursery: "/logos/nursery-logo.png",
      sujunor: "/logos/sujunor-logo.png",
      susenior: "/logos/susenior-logo.png",
      sujunior: "/logos/sujunor-logo.png",
      playschool: "/logos/playgroup-logo.png",
    };
    return map[normalized] || "/placeholder-logo.png";
  };

  /* fetch user once */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/profile`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("unauthorized");
        const data = await res.json();
        setUserName(data.name || "");
        setUserRole(data.role || "User");
        setPhotoUrl(data.photoUrl || "");
        setInstitute(data.institute || "");
        const newLogo = getInstituteLogo(data.institute || "");
        setLogoPath(newLogo);
      } catch (err) {
        console.error("Failed to fetch user info", err);
      }
    };
    void load();
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

      {/* container with flex justify-between */}
      <div className="flex flex-1 items-center justify-between gap-4">
        {/* left side - logo + title */}
        <div className="flex items-center gap-2">
          {logoPath && !logoError ? (
            <img
              src={logoPath}
              alt={institute ? `${institute} Logo` : "Institute Logo"}
              className="h-8 w-auto"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="h-8 w-8 rounded bg-emerald-100" />
          )}
          <span className="font-semibold text-sm text-left truncate text-emerald-800">
            SUNOIAKIDS PRE-SCHOOL SYSTEM
          </span>
        </div>

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

          {/* avatar (picture OR lucide icon) */}
          {photoUrl && !imageError ? (
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={photoUrl}
                alt={userName}
                onError={() => setImageError(true)}
              />
              <AvatarFallback className="uppercase">
                {userName.slice(0, 2)}
             
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center">
              <UserCircle className="h-9 w-9 text-emerald-700" />
            </div>
          )}

          {/* dropdown */}
          <UserProfileMenu
            userName={userName}
            userRole={userRole}
            photoUrl={photoUrl && !imageError ? photoUrl : undefined}
          />
        </div>
      </div>
    </header>
  );
}
