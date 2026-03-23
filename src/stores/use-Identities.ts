// stores/useIdentities.ts
import { createClient } from "@/lib/supabase/client";
import { UserIdentity } from "@supabase/supabase-js";
import { create } from "zustand";

interface IdentitiesStore {
  identities: UserIdentity[];
  isLoading: boolean;
  hasFetched: boolean;

  setIdentities: (identities: UserIdentity[]) => void;
  fetchIdentities: () => Promise<void>;
  resetAndRefetch: () => Promise<void>;
}

export const useIdentities = create<IdentitiesStore>()((set, get) => ({
  identities: [],
  isLoading: false,
  hasFetched: false,

  setIdentities: (identities) => set({ identities }),

  fetchIdentities: async () => {
    const { hasFetched, isLoading } = get();

    if (hasFetched || isLoading) return;

    set({ isLoading: true });

    const supabase = createClient();

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        set({ identities: [], isLoading: false, hasFetched: true });
        return;
      }

      set({
        identities: user.identities ?? [],
        isLoading: false,
        hasFetched: true,
      });
    } catch (err) {
      console.error("Unexpected error:", err);
      set({ isLoading: false });
    }
  },

  resetAndRefetch: async () => {
    set({ hasFetched: false });
    await get().fetchIdentities();
  },
}));

export default useIdentities;