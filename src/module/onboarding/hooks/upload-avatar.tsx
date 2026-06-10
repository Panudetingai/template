"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDropzone } from "react-dropzone";
import { useAvatarUploadStore } from "../store/avatar-upload";



export default function UploadAvatar({ initials }: { initials: string }) {
  const { setFile, file } = useAvatarUploadStore();
  
  const {getRootProps, getInputProps} = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    }
  });

  return (
    <Avatar size="lg" className="size-32" {...getRootProps()}>
      <input {...getInputProps()} />
      <AvatarImage src={file ? URL.createObjectURL(file) : undefined} />
      <AvatarFallback className="text-lg">{initials ?? "U"}</AvatarFallback>
    </Avatar>
  );
}
