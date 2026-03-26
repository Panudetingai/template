"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { api } from "@/lib/elysia/eden-client";
import { RepositoryResponse } from "@/module/services/types";
import { Github } from "@lobehub/icons";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useEffect } from "react";
import { useStateSelectStore } from "../stores/use-state-select";

export default function SelectRepo() {
  const isOpen = useStateSelectStore((state) => state.isOpen);
  const setIsOpen = useStateSelectStore((state) => state.setIsOpen);
  const setSelectedRepo = useStateSelectStore((state) => state.setSelectedRepo);
  const selectedRepo = useStateSelectStore((state) => state.selectedRepo);

  const { data: repositories, isPending: reposLoading } = useQuery({
    queryKey: ["repositories", "classifier"],
    queryFn: async () => {
      const response = await api.repositorie.get();
      if (response.error) throw new Error(response.error.message as string);

      return response.data.repositories as RepositoryResponse[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const repoPublic = repositories?.filter((r) => !r.private);
  const repoPrivate = repositories?.filter((r) => r.private);

  const handleSelectRepo = (repo: RepositoryResponse) => {
    setSelectedRepo({
      owner: repo.owner.login,
      name: repo.name,
      label: repo.full_name ?? `${repo.owner.login}/${repo.name}`,
    });
    setIsOpen(false);
  }

  useEffect(() => {
    if (repositories && repositories.length > 0) {
      setSelectedRepo({
        owner: repositories[0].owner.login,
        name: repositories[0].name,
        label: repositories[0].full_name ?? `${repositories[0].owner.login}/${repositories[0].name}`,
      });
    }
  }, [repositories]);

  return (
    <div>
      <Button
        className="w-full"
        size="lg"
        disabled={reposLoading}
        onClick={() => setIsOpen(true)}
      >
        <Github size={20} />
        {reposLoading ? "กำลังโหลด repo…" : selectedRepo.label}
        <ChevronDown size={20} />
      </Button>
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <Command>
          <CommandInput placeholder="Search repository..." />
          <CommandList>
            <CommandEmpty>
              <div className="flex items-center gap-2">
                <Github size={20} />
                <p className="text-sm text-muted-foreground">
                  No repositories found
                </p>
              </div>
            </CommandEmpty>
            <CommandGroup heading="Public Repositories">
              {repoPublic?.map((o) => (
                <CommandItem
                  key={o.id}
                  onSelect={() => handleSelectRepo(o)}
                >
                  <div className="flex items-center gap-2">
                    <Github size={20} />
                    <p>{o.full_name}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Private Repositories">
              {repoPrivate?.map((o) => (
                <CommandItem key={o.id} onSelect={() => handleSelectRepo(o)}>
                  <div className="flex items-center gap-2">
                    <Github size={20} />
                    <p>{o.full_name}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
