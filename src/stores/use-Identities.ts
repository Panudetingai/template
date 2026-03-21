// stores/useIdentities.ts
import { createClient } from "@/lib/supabase/client";
import { UserIdentity } from "@supabase/supabase-js";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IdentitiesStore {
  identities: UserIdentity[];
  isLoading: boolean;
  hasFetched: boolean;

  setIdentities: (identities: UserIdentity[]) => void;
  fetchIdentities: () => Promise<void>;
  resetAndRefetch: () => Promise<void>;
}

export const useIdentities = create<IdentitiesStore>()(
  persist(
    (set, get) => ({
      identities: [],
      isLoading: false,
      hasFetched: false,

      setIdentities: (identities) => set({ identities }),

      fetchIdentities: async () => {
        const { hasFetched, isLoading } = get();

        // ✅ กันยิงซ้ำ
        if (hasFetched || isLoading) return;

        set({ isLoading: true });

        const supabase = createClient();

        try {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();

          if (error || !user) {
            console.error("Error fetching user:", error);
            set({ isLoading: false });
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

      // ✅ reset แล้ว fetch ใหม่ทันที
      resetAndRefetch: async () => {
        set({ hasFetched: false });
        await get().fetchIdentities();
      },
    }),
    {
      name: "identities-storage",
      partialize: (state) => ({
        identities: state.identities,
        hasFetched: state.hasFetched,
      }),
    }
  )
);

export default useIdentities;