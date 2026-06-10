import { createClient } from "@/lib/supabase/client";
import { create } from "zustand";

interface AvatarUploadState {
    file: File | null;
    setFile: (file: File) => void;
    handleUploadAvatar: (file: File) => Promise<void>;
}

export const useAvatarUploadStore = create<AvatarUploadState>((set) => ({
    file: null,
    setFile: (file) => set({ file }),

    handleUploadAvatar: async (file) => {
        const supabase = createClient();
        const { data, error } = await supabase.storage.from("avatars").upload(file.name, file);
        if (error) throw new Error(error.message);
        set({ file: data.path ? new File([], data.path) : null });
    }
}));