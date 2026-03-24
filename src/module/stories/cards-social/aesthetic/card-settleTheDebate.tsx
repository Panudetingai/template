"use client";

import { cn } from "@/lib/utils";
import { CreditCard, Sparkles } from "lucide-react";
import { forwardRef } from "react";

export type SettleTheDebateProps = {
  className?: string;
  layout?: "standalone" | "canvas";
  text1?: string;
  text2?: string;
  text3?: string;
  text4?: string;
  text5?: string;
  Icon1?: React.ReactNode;
  Icon2?: React.ReactNode;
  bottomLeftList?: string[];
};

export const SettleTheDebate = forwardRef<HTMLDivElement, SettleTheDebateProps>(function SettleTheDebate(
  {
    className,
    layout = "standalone",
    text1 = "Settle",
    text2 = "the debate",
    text3 = "which",
    text4 = "is the best?",
    text5 = "Revolut Card",
    Icon1 = <CreditCard className="text-white" size={24} />,
    Icon2 = <Sparkles className="text-white" size={24} fill="white" />,
    bottomLeftList = ["DAYILY • 2025"],
  }, ref,
) {
    return (
        <div ref={ref} className={cn("relative isolate flex flex-col p-2 overflow-hidden rounded-[inherit]", layout === "standalone"
          ? "aspect-[9/16] w-full @container/card [container-type:inline-size]"
          : "h-full min-h-0 w-full",
        className,)} style={{ backgroundColor: "#ffffff", color: "#000000" }}>
          <div className="flex flex-col items-start gap-2 font-sans font-bold uppercase tracking-tight">
            
            <div className="rounded-full bg-black px-6 py-2 text-3xl text-white">
              {text1}
            </div>
    
            <div className="rounded-full bg-black px-6 py-2 text-3xl text-white">
              {text2}
            </div>
    
            <div className="flex gap-2">
              <div className="flex items-center justify-center rounded-full bg-black px-5 text-3xl text-white">
                —
              </div>
              <div className="rounded-full bg-black px-8 py-2 text-3xl text-white">
                which
              </div>
            </div>
    
            {/* แถวที่ 4 ไฮไลท์สีเขียว + ไอคอน */}
            <div className="flex gap-2 mt-16">
              <div className="rounded-full bg-[#b4ff39] px-6 py-2 text-2xl text-black">
                {text4}
              </div>
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-black">
                {Icon1}
              </div>
            </div>
    
            {/* แถวที่ 5 */}
            <div className="flex gap-2">
              <div className="rounded-full bg-[#b4ff39] px-6 py-2 text-xl text-black flex items-center justify-center">
                {text5}
              </div>
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-black">
                {Icon2}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0">
                <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                        {bottomLeftList.map((item, index) => (
                            <div key={index} className="text-sm text-gray-500">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        </div>
      );
});