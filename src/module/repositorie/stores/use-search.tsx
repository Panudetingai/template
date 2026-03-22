import { RepositoryResponse } from "@/module/services/types";
import { create } from "zustand";

function filterRepos(repos: RepositoryResponse[], query: string): RepositoryResponse[] {
    const q = query.trim().toLowerCase();
    if (!q) return repos;
    return repos.filter(
        (r) =>
            r.name.toLowerCase().includes(q) ||
            (r.description?.toLowerCase() ?? "").includes(q),
    );
}

interface SearchState {
    search: string;
    repositories: RepositoryResponse[];
    filteredRepositories: RepositoryResponse[];
    setSearch: (search: string) => void;
    setRepositories: (repositories: RepositoryResponse[]) => void;
}

export const useSearchRepositorie = create<SearchState>((set, get) => ({
    search: "",
    repositories: [],
    filteredRepositories: [],

    setRepositories: (repositories) =>
        set({
            repositories,
            filteredRepositories: filterRepos(repositories, get().search),
        }),

    setSearch: (search) =>
        set({
            search,
            filteredRepositories: filterRepos(get().repositories, search),
        }),
}));