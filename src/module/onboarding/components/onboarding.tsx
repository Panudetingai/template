"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import SetupProfile from "./setup-profile";

export default function Onboarding() {
    const [step, setStep] = useState<number>(0);


  return (
    <AnimatePresence>
      <motion.div
        key="onboarding"
        suppressHydrationWarning
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.5 }}
      >
        {step === 0 && (
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -100 }}
                transition={{ duration: 0.5 }}
            >
                <SetupProfile onComplete={() => setStep(1)} />
            </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}