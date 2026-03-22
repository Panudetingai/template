import ListRepositories from "@/module/repositorie/components/list-repositorie";
import SearchRepositorie from "@/module/repositorie/components/search-repositorie";

export default function page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold">Repositories List</h1>
        <p className="text-muted-foreground text-sm">
          Manage your repositories and sync them with your database.
        </p>
      </div>
      <div>
        <SearchRepositorie />
      </div>
      <div>
        <ListRepositories />
      </div>
    </div>
  );
}
