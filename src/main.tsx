import "./index.css";
import "@biqpod/app/ui/style.css";
import { startApplication } from "@biqpod/app/ui/app";
import { StoreRoute } from "./components/StoreRoute";
import { BrowserRouter } from "react-router-dom";
import { delay } from "@biqpod/app/ui/utils";
import { motion } from "framer-motion";
import photoState from "../public/photo.png";
import { initMyCloud } from "@biqpod/app/ui/apis";
import { setLangs } from "@biqpod/app/ui/hooks";
export const cloud = initMyCloud({
  apiKey: "AIzaSyB0XSUnBSOaIWp-37u2N4ib5bY8-09Zeq0",
  authDomain: "water-fetch.firebaseapp.com",
  databaseURL: "https://water-fetch-default-rtdb.firebaseio.com",
  projectId: "water-fetch",
  storageBucket: "water-fetch.appspot.com",
  messagingSenderId: "911813185967",
  appId: "1:911813185967:web:4447a361eeaddd00315f5a",
  measurementId: "G-8GB7LZPHVX",
  functions: {
    devUri: (fnId) => `http://localhost:3000/invoke/${fnId}`,
    prodUri: (fnId) => {
      return true
        ? `http://localhost:3000/invoke/${fnId}`
        : `https://developed-nickie-biqpod-7b27f741.koyeb.app/invoke/${fnId}`;
    },
  },
});
cloud.setAsMain();
startApplication(
  <BrowserRouter>
    <StoreRoute />
  </BrowserRouter>,
  {
    isDev: import.meta.env.DEV,
    async onPrepare() {
      setLangs([]);
      await delay(2000);
    },
    loading: () => (
      <div className="flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 h-full overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating orbs */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Main Logo Container */}
        <motion.div
          className="z-10 relative flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Logo with sophisticated animations */}
          <motion.div
            className="relative mb-8"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Glowing ring around logo */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 rounded-full"
              style={{ padding: "20px" }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Main logo image */}
            <motion.img
              src={photoState}
              alt="Loading..."
              className="z-10 relative w-24 h-24 object-contain"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Sparkle effects */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-yellow-400 rounded-full w-2 h-2"
                style={{
                  left: `${50 + Math.cos(i * 45 * (Math.PI / 180)) * 60}px`,
                  top: `${50 + Math.sin(i * 45 * (Math.PI / 180)) * 60}px`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>

          {/* Loading text with typewriter effect */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.p
              className="text-gray-600 text-sm"
              style={{ fontFamily: "Inter, sans-serif" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Here For You
            </motion.p>
          </motion.div>

          {/* Loading progress indicator */}
          <motion.div
            className="bg-gray-200 mt-6 rounded-full w-48 h-1 overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-full"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Pulsing dots */}
          <motion.div
            className="flex space-x-2 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="bg-blue-500 rounded-full w-2 h-2"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    ),
  }
);
