import { Button } from "@/components/ui/button";
import routerConfig from "@/configs/route.config";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col max-w-3xl mx-auto justify-center h-screen">
      <div className="flex items-start gap-6">
        <Image src={"/favicon.ico"} alt="Dayily Logo" width={60} height={60} />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Welcome to Dayily V2</h1>
          <p className="text-muted-foreground">
            Dayily is a platform for creating and sharing your ideas. It is a
            work in progress and will be updated soon.
          </p>
          <Button className="w-26 mt-4">
            <Link href={routerConfig.app.Repositorie} className="flex items-center gap-2">
              Try it out <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
