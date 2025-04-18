"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Check } from "lucide-react"

export function VerificationSuccessAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
        className="relative"
      >
        {/* Outer circle animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1.2 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          className="absolute inset-0 rounded-full bg-green-500 opacity-30"
        />

        {/* Middle circle animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.6, scale: 1.1 }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 0.2,
          }}
          className="absolute inset-0 rounded-full bg-green-500 opacity-60"
        />

        {/* Base circle */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </motion.div>

          {/* Checkmark overlay with bounce animation */}
          <motion.div
            className="absolute"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.8,
              duration: 0.5,
              type: "spring",
              stiffness: 300,
            }}
          >
            <Check className="h-8 w-8 text-white" />
          </motion.div>
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-6 text-2xl font-bold text-center"
      >
        Email Verified Successfully!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-2 text-center text-muted-foreground"
      >
        Your account is now fully activated. You can access all features of the platform.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="mt-6 bg-green-50 border border-green-200 rounded-md p-4 max-w-md"
      >
        <p className="text-sm text-green-800 font-medium">What's next?</p>
        <ul className="mt-2 text-sm text-green-700 space-y-1 list-disc list-inside">
          <li>Complete your profile information</li>
          <li>Explore available courses</li>
          <li>Connect with educators and fellow students</li>
          <li>Start your learning journey</li>
        </ul>
      </motion.div>
    </div>
  )
}
