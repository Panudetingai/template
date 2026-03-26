import { create } from "zustand";

interface SelectState {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    selectedRepo: {
        owner: string;
        name: string;
        label: string;
    };
    setSelectedRepo: (repo: {
        owner: string;
        name: string;
        label: string;
    }) => void;
}

export const useStateSelectStore = create<SelectState>((set) => ({
    isOpen: false,
    setIsOpen: (isOpen: boolean) => set({ isOpen }),
    selectedRepo: {
        owner: '',
        name: '',
        label: 'เลือก repository',
    },
    setSelectedRepo: (repo: {
        owner: string;
        name: string;
        label: string;
    }) => set({ selectedRepo: repo }),
}))