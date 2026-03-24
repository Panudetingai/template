import { create } from "zustand";

export type ModalType = "preview" | "select";

interface ModalStore {
    modal: ModalType | null;
    setModal: (modal: ModalType | null) => void;
}

const useModalStore = create<ModalStore>((set) => ({
    modal: null,
    setModal: (modal) => set({ modal }),
}));

export default useModalStore;