'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import React from 'react'

interface Props {
    open: boolean;
    onClose: () => void;
    setPrompt: (prompt: string) => void;
    prompt: string;
    onGenerate: () => void;
}

export default function PromptModal({ open, onClose, setPrompt, prompt, onGenerate }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='max-w-lg w-full'>
            <DialogHeader>
                <DialogTitle>Prompt Generator</DialogTitle>
                <DialogDescription>
                    Generate a prompt for your product.
                </DialogDescription>
            </DialogHeader>
            <div>
                <Textarea 
                    placeholder='e.g. A white t-shirt with a logo'
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className='h-40 resize-none'
                />
            </div>
            <DialogFooter>
                <Button onClick={onClose}>Close</Button>
                <Button 
                    onClick={onGenerate}
                    disabled={!prompt}
                >
                    <Sparkles className='size-4' />
                    Generate Image
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}