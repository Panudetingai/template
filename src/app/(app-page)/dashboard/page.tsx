import { GridPreview } from "@/module/dashboard/components/grid-preview";
import { listProductGenerations } from "@/module/dashboard/server/list-product-generations";
export const dynamic = "force-dynamic"

export default async function Page() {
  const rows = await listProductGenerations()

  return (
    <div className="flex flex-col gap-4 p-4">
      <GridPreview initialRows={rows} />
    </div>
  )
}
