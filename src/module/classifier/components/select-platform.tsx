'use client';

import { Button } from "@/components/ui/button";
import { FacebookIcon, InstagramIcon, TwitterIcon } from "lucide-react";

export default function SelectPlatform() {
    return (
        <div className="flex gap-4 w-full justify-center items-center">
            <Button className="flex-1">
                <TwitterIcon />
                Twitter
            </Button>
            <Button className="flex-1">
                <FacebookIcon />
                Facebook
            </Button>
            <Button className="flex-1">
                <InstagramIcon />
                Instagram
            </Button>
        </div>
    )
}