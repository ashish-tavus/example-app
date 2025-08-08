"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import * as React from "react";

interface StatefulButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loadingText?: string;
  successText?: string;
}

export const StatefulButton = React.forwardRef<HTMLButtonElement, StatefulButtonProps>(
  ({ className, children, loadingText = "Loading...", successText = "Success!", onClick, ...props }, ref) => {
    const [status, setStatus] = React.useState<"idle" | "loading" | "success">("idle");

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (status !== "idle") return;

      try {
        setStatus("loading");

        if (onClick) {
          await onClick(e);
        }

        setStatus("success");

        // Reset back to idle after 2 seconds
        setTimeout(() => {
          setStatus("idle");
        }, 2000);
      } catch (err) {
        setStatus("idle");
        console.error("Error in button click:", err);
      }
    };

    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center px-8 py-3 overflow-hidden rounded-full transition-all duration-300",
          "border-2 border-white/30 hover:border-white/60",
          "ring-2 ring-white/20 ring-offset-2 ring-offset-black/20 hover:ring-white/40 shadow-lg",
          status === "loading" && "cursor-not-allowed",
          className
        )}
        onClick={handleClick}
        disabled={status !== "idle"}
        {...props}
      >
        {/* Background color transition */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={false}
          animate={{
            backgroundColor: status === "success"
              ? "rgb(16 185 129)" // emerald-500
              : status === "loading"
                ? "rgb(99 102 241)" // indigo-500
                : "rgb(168 85 247)", // purple-500
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Text container */}
        <div className="relative z-10 text-white font-medium flex items-center gap-2 overflow-hidden">
          {/* Loading spinner */}
          {status === "loading" && (
            <motion.div
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
          )}

          {/* Success checkmark */}
          {status === "success" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-4 h-4"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M20 6L9 17L4 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
            </motion.div>
          )}

          <div className="relative inline-flex items-center gap-2">
            {status === "idle" && (
              <>
                <div className="relative flex items-center justify-center w-3 h-3">
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: ["rgb(34 197 94)", "rgb(239 68 68)", "rgb(34 197 94)"],
                      boxShadow: [
                        "0 0 8px rgba(34, 197, 94, 0.6)",
                        "0 0 12px rgba(239, 68, 68, 0.8)",
                        "0 0 8px rgba(34, 197, 94, 0.6)"
                      ],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: "rgb(34 197 94)", // green-500 as default
                      boxShadow: "0 0 8px rgba(34, 197, 94, 0.6)"
                    }}
                  />
                </div>
                <motion.span
                  initial={false}
                  animate={{
                    opacity: [1, 0.7, 1],
                    textShadow: [
                      "0 0 0px rgba(255,255,255,0)",
                      "0 0 8px rgba(255,255,255,0.5)",
                      "0 0 0px rgba(255,255,255,0)"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {children}
                </motion.span>
              </>
            )}
            {status === "loading" && (
              <motion.span
                initial={false}
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {loadingText}
              </motion.span>
            )}
            {status === "success" && (
              <motion.span
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {successText}
              </motion.span>
            )}
          </div>
        </div>

        {/* Hover effect */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.1 }}
          transition={{ duration: 0.15 }}
          style={{ backgroundColor: "white" }}
        />
      </button>
    );
  }
);

StatefulButton.displayName = "StatefulButton";
