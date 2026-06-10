"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Camera } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useAvatarUploadStore } from "../store/avatar-upload";

interface UploadAvatarProps {
  initials: string;
  userId: string;
  value?: string;
  onChange?: (url: string) => void;
}

export default function UploadAvatar({
  initials,
  userId,
  value,
  onChange,
}: UploadAvatarProps) {
  const { uploadAvatar, isUploading } = useAvatarUploadStore();
  const [preview, setPreview] = useState<string | undefined>(value);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: isUploading,
    onDrop: (acceptedFiles, fileRejections) => {
      if (fileRejections.length) {
        toast.error("Please choose an image up to 5MB.");
        return;
      }
      const file = acceptedFiles[0];
      if (!file) return;

      setPreview(URL.createObjectURL(file));
      uploadAvatar(file, userId)
        .then((url) => onChange?.(url))
        .catch((error) => {
          toast.error(
            error instanceof Error ? error.message : "Failed to upload avatar.",
          );
          setPreview(value);
        });
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative size-20 cursor-pointer rounded-full",
        isUploading && "pointer-events-none",
      )}
    >
      <input {...getInputProps()} />
      <Avatar size="lg" className="size-20">
        <AvatarImage src={preview} />
        <AvatarFallback className="text-lg">{initials || "U"}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center rounded-full bg-foreground/40 text-background opacity-0 transition-opacity group-hover:opacity-100",
          (isUploading || isDragActive) && "opacity-100",
        )}
      >
        {isUploading ? (
          <Spinner className="size-5" />
        ) : (
          <Camera className="size-5" />
        )}
      </div>
    </div>
  );
}
