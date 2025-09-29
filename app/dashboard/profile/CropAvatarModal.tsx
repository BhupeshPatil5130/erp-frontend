"use client";

import { useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Props = {
  open: boolean;
  file: File | null;
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
};

const cropToFile = async (file: File, area: any) => {
  const img = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = area.width;
  canvas.height = area.height;
  canvas.getContext("2d")!.drawImage(
    img,
    area.x, area.y, area.width, area.height,
    0, 0, area.width, area.height
  );
  const blob = await new Promise<Blob>((res) =>
    canvas.toBlob(b => res(b!), "image/png", 0.9)
  );
  const compressed = await imageCompression(blob, { maxWidthOrHeight: 512 });
  return new File([compressed], file.name, { type: compressed.type });
};

export default function CropAvatarModal({ open, file, onClose, onSave }: Props) {
  const { toast } = useToast();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<any>(null);

  useEffect(() => {
    if (open) { setCrop({ x: 0, y: 0 }); setZoom(1); setArea(null); }
  }, [open]);

  const finish = useCallback(async () => {
    if (!file) return;
    toast({ title: "Uploading…" });
    try {
      const fileToUpload = area ? await cropToFile(file, area) : file;
      await onSave(fileToUpload);
      toast({ title: "Uploaded ✅" });
      onClose();
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
  }, [file, area, onSave, onClose, toast]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>Crop your avatar</DialogTitle></DialogHeader>

        {file ? (
          <>
            <div className="relative h-64 bg-muted rounded-md overflow-hidden">
              <Cropper
                image={URL.createObjectURL(file)}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, a) => setArea(a)}
                onMediaLoaded={({ width, height }) =>
                  setArea({ x: 0, y: 0, width, height })
                }
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={finish}>Save</Button>
            </DialogFooter>
          </>
        ) : (
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
            Loading image…
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
