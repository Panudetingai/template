import { createClient } from "@/lib/supabase/client";
import { create } from "zustand";

const AVATAR_BUCKET = "avatars";

interface AvatarUploadState {
  isUploading: boolean;
  /**
   * Uploads an avatar to Supabase storage and returns its public URL.
   * Requires a public `avatars` bucket with an insert policy for authenticated
   * users (see README / Supabase dashboard).
   */
  uploadAvatar: (file: File, userId: string) => Promise<string>;
}

export const useAvatarUploadStore = create<AvatarUploadState>((set) => ({
  isUploading: false,

  uploadAvatar: async (file, userId) => {
    set({ isUploading: true });
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw new Error(error.message);

      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      return data.publicUrl;
    } finally {
      set({ isUploading: false });
    }
  },
}));
