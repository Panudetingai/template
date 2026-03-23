"use client";

import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";
import { useSearchRepositorie } from "../stores/use-search";

export default function SearchRepositorie() {
  const search = useSearchRepositorie((s) => s.search);
  const setSearch = useSearchRepositorie((s) => s.setSearch);

  return (
    <div className="flex gap-2 w-full">
      <InputGroup>
        <InputGroupInput
          placeholder="Search for a repository..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
