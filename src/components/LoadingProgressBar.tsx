import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND_COLOR, BRAND_COLOR_SECONDARY } from "./utils";
export const LoadingProgressBar = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    // Start loading when pathname changes
    setIsLoading(true);
    setProgress(0);
    let progressTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;
    // Start progress animation immediately
    const startProgress = () => {
      progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressTimer);
            return 100;
          }
          // Faster, more realistic progress increments
          return prev + Math.random() * 25 + 10;
        });
      }, 80);
    };
    // Small delay to ensure the loading bar is visible
    const initTimer = setTimeout(() => {
      startProgress();
    }, 50);
    // Hide loading bar after completion
    hideTimer = setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 1200);
    return () => {
      clearTimeout(initTimer);
      clearInterval(progressTimer);
      clearTimeout(hideTimer);
    };
  }, [location.pathname]); // This will trigger on every route change
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0, scaleX: 0 }}
          transition={{ duration: 0.15 }}
          className="top-0 right-0 left-0 z-50 fixed"
          style={{ transformOrigin: "left" }}
        >
          {/* Progress Bar Container */}
          <div className="relative bg-gray-100/50 w-full h-1">
            {/* Main Progress Bar */}
            <motion.div
              className="top-0 left-0 absolute h-full"
              style={{
                background: `linear-gradient(90deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_SECONDARY} 50%, ${BRAND_COLOR} 100%)`,
                boxShadow: `0 0 8px ${BRAND_COLOR}60, 0 0 20px ${BRAND_COLOR_SECONDARY}30`,
              }}
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
            />
            {/* Animated Shimmer Effect */}
            <motion.div
              className="top-0 left-0 absolute w-24 h-full"
              style={{
                background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)`,
                filter: "blur(1px)",
              }}
              animate={{
                x: ["-100px", "calc(100vw + 100px)"],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            {/* Pulsing Glow Effect */}
            <motion.div
              className="top-0 left-0 absolute w-full h-1"
              style={{
                background: `radial-gradient(ellipse at center, ${BRAND_COLOR}40 0%, transparent 70%)`,
                filter: "blur(2px)",
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scaleY: [1, 1.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
