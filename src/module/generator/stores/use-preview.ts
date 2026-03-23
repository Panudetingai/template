import { create } from "zustand"
import type { Platform } from "./use-generator"

export interface PostContent {
  content: string
}

export type PreviewPosts = {
  [K in Platform]: PostContent | null
}

interface PreviewStore {
  posts: PreviewPosts
  setPosts: (posts: PreviewPosts | ((prev: PreviewPosts) => PreviewPosts)) => void
}

const initialPosts: PreviewPosts = {
  twitter: null,
  facebook: null,
  instagram: null,
}

export const usePreviewStore = create<PreviewStore>((set) => ({
  posts: { ...initialPosts },
  setPosts: (postsOrFn) =>
    set((state) => ({
      posts:
        typeof postsOrFn === "function"
          ? postsOrFn(state.posts)
          : postsOrFn,
    })),
}))