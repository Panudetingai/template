'use client';

import { motion } from "motion/react";
import { Loader2, PlusIcon } from "lucide-react";
import { generateProduction } from "../server/generate-production";
import { uuidv4 } from "zod";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ProductionGeneratedDesignRow } from "../server/list-product-generations";
import PromptModal from "./prompt-modal";
import { Spinner } from "@/components/ui/spinner";
type Props = {
    initialRows: ProductionGeneratedDesignRow[]
}

export function GridPreview({ initialRows }: Props) {
    const [rows, setRows] = useState<ProductionGeneratedDesignRow[]>(initialRows);
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState("");

    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    }
    const handleSetPrompt = (prompt: string) => {
        setPrompt(prompt);
    }


    const { mutateAsync: generateProductionAsync, isPending: isGenerating } = useMutation({
        mutationFn: generateProduction,
        onSuccess: (data) => {
            setRows([...rows, {
                id: uuidv4().toString(),
                generatedImageUrl: data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }]);
        },
        onError: (error) => {
            console.error(error);
        },
    });

    return (
        <motion.div className="grid grid-cols-3 gap-4">
            {rows.map((row, index) => (
                <motion.div key={index} className="overflow-hidden rounded-md">
                    <motion.img
                        src={row.generatedImageUrl}
                        alt={index.toString()}
                        className="w-full h-full object-cover"
                        width={100}
                        height={100}
                    />
                </motion.div>
            ))}
            <motion.div
                onClick={handleOpen}
                className="flex items-center justify-center border-dashed border rounded-md aspect-square cursor-pointer">
                <AddNewProductGeneration isGenerating={isGenerating} />
            </motion.div>
            <PromptModal
                onGenerate={() => {
                    generateProductionAsync({ prompt: prompt })
                    handleClose();
                }}
                open={open}
                onClose={handleClose}
                setPrompt={handleSetPrompt}
                prompt={prompt}
            />
        </motion.div>
    )
}

function AddNewProductGeneration({ isGenerating }: { isGenerating: boolean }) {
    if (isGenerating) {
        return (
            <Spinner className="size-4" />
        )
    }
    return (
        <PlusIcon className="size-4" />
    )
}