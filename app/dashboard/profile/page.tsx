"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CropAvatarModal from "./CropAvatarModal";

export default function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing]   = useState(false);
  const [loading, setLoading]       = useState(true);
  const [photoURL, setPhotoURL]     = useState("");
  const [cropOpen, setCropOpen]     = useState(false);
  const [rawFile, setRawFile]       = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "", email: "", institute: "", phone: "", address: "",
    photoUrl: "", preferences: { emailNotifications: true, smsAlerts: false, darkMode: false },
    twoFactorEnabled: false,
  });

  /* fetch profile on mount */
  useEffect(() => {
    axios.get( "http://localhost:4000/api/profile", { withCredentials: true })
      .then(res => {
        const u = res.data;
        setFormData({
          name: u.name ?? "", email: u.email ?? "", institute: u.institute ?? "",
          phone: u.phone ?? "", address: u.address ?? "", photoUrl: u.photoUrl ?? "",
          preferences: u.preferences ?? formData.preferences,
          twoFactorEnabled: u.twoFactorEnabled ?? false,
        });
        setPhotoURL(u.photoUrl ?? "");
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* helpers */
  const handleChange = (e: any) =>
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handlePreferencesChange = (k: string, v: boolean) =>
    setFormData(p => ({ ...p, preferences: { ...p.preferences, [k]: v } }));

  const handle2FAChange = (v: boolean) =>
    setFormData(p => ({ ...p, twoFactorEnabled: v }));

  /* pick file → open modal */
  const pickFile = (e: any) => {
    console.log("pickFile fired");
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/"))
      return toast({ title: "Only images allowed", variant: "destructive" });
    if (f.size > 2 * 1024 * 1024)
      return toast({ title: "Max 2 MB image", variant: "destructive" });
    setRawFile(f);
    setCropOpen(true);
  };

  /* close modal → reset file & input */
  const closeCropModal = () => {
    console.log("closing modal – resetting");
    setCropOpen(false);
    setRawFile(null);
    if (fileRef.current) fileRef.current.value = "";   // allow same file again
  };

  /* upload + persist */
  const uploadAvatar = async (file: File) => {
    const fd = new FormData();
    fd.append("profile", file);

    try {
      const { data } = await axios.post( "http://localhost:4000/api/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setPhotoURL(data.url);
      setFormData(p => ({ ...p, photoUrl: data.url }));

      await axios.put(
         "http://localhost:4000/api/profile",
        { photoUrl: data.url },
        { withCredentials: true }
      );

      toast({ title: "Profile photo updated ✅" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
  };

  /* save full profile */
  const handleSaveChanges = () =>
    axios.put( "http://localhost:4000/api/profile", formData, { withCredentials: true })
      .then(() => { toast({ title: "Profile Updated" }); setIsEditing(false); })
      .catch(() => toast({ title: "Could not update profile", variant: "destructive" }));

  if (loading) return <p>Loading…</p>;

  return (
    <>
      <CropAvatarModal
        open={cropOpen}
        file={rawFile}
        onClose={closeCropModal}
        onSave={uploadAvatar}
      />

      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-1">My Profile</h1>
        <p className="text-muted-foreground mb-6">View and manage your profile information</p>

        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Profile Details</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Details */}
          <TabsContent value="details">
            <div className="grid gap-6 md:grid-cols-3">
              {/* avatar */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Profile Photo</CardTitle>
                  <CardDescription>Your profile picture</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Avatar className="h-32 w-32 mb-4">
                    {photoURL && <AvatarImage src={photoURL} />}
                    <AvatarFallback className="text-2xl">
                      {formData.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <input ref={fileRef} hidden type="file" accept="image/*" onChange={pickFile} />
                  <Button variant="outline" onClick={() => fileRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Upload Photo
                  </Button>
                </CardContent>
              </Card>

              {/* personal info */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Your basic profile details</CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={() => (isEditing ? handleSaveChanges() : setIsEditing(true))}
                    >
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {["name", "institute", "email", "phone"].map((field) => (
                        <div key={field} className="space-y-2">
                          <Label htmlFor={field}>
                            {field[0].toUpperCase() + field.slice(1)}
                          </Label>
                          <Input
                            id={field}
                            name={field}
                            value={(formData as any)[field]}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between border-t pt-6">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <Switch checked={formData.twoFactorEnabled} onCheckedChange={handle2FAChange} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>User Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(formData.preferences).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{k.replace(/([A-Z])/g, " $1")}</p>
                      <p className="text-sm text-muted-foreground">
                        Toggle {k.replace(/([A-Z])/g, " $1").toLowerCase()}
                      </p>
                    </div>
                    <Switch
                      checked={v}
                      onCheckedChange={c => handlePreferencesChange(k, c)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
