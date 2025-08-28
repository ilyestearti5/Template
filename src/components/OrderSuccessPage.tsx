import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHistory } from "react-router-dom";
import { Icon, Translate } from "@biqpod/app/ui/components";
import { allIcons } from "@biqpod/app/ui/apis";
import { Button } from "./Custom";
import { BRAND_COLOR } from "./utils";

export const OrderSuccessPage = () => {
  const history = useHistory();
  const [showConfetti, setShowConfetti] = useState(true);
  const [showSuccessIcon, setShowSuccessIcon] = useState(false);

  useEffect(() => {
    // Start success icon animation after a short delay
    const timer = setTimeout(() => {
      setShowSuccessIcon(true);
    }, 500);

    // Hide confetti after animation
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, []);

  // Confetti animation component
  const ConfettiPiece = ({
    delay,
    duration,
    x,
    color,
  }: {
    delay: number;
    duration: number;
    x: number;
    color: string;
  }) => (
    <motion.div
      className="absolute rounded-full w-2 h-2"
      style={{
        backgroundColor: color,
        left: x,
        top: -10,
      }}
      initial={{ y: -10, opacity: 1, rotate: 0, scale: 1 }}
      animate={{
        y: typeof window !== "undefined" ? window.innerHeight + 50 : 800,
        x: x + (Math.random() - 0.5) * 300,
        opacity: [1, 0.8, 0],
        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
        scale: [1, 0.8, 0.2],
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: "easeOut",
      }}
    />
  );

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <div className="z-50 fixed inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <ConfettiPiece
                key={i}
                delay={Math.random() * 2}
                duration={2 + Math.random() * 2}
                x={
                  Math.random() *
                  (typeof window !== "undefined" ? window.innerWidth : 800)
                }
                color={
                  [
                    "#ff6b6b",
                    "#4ecdc4",
                    "#45b7d1",
                    "#96ceb4",
                    "#ffeaa7",
                    "#dda0dd",
                    "#98d8c8",
                  ][Math.floor(Math.random() * 7)]
                }
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="flex justify-center items-center p-4 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="bg-white shadow-2xl rounded-3xl w-full max-w-md overflow-hidden"
        >
          {/* Success Icon Section */}
          <div className="bg-gradient-to-r from-green-400 to-green-600 p-8 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={showSuccessIcon ? { scale: 1, rotate: 0 } : {}}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
              className="inline-flex justify-center items-center bg-white mb-4 rounded-full w-24 h-24"
            >
              <motion.div
                animate={showSuccessIcon ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.6, repeat: 2, delay: 0.8 }}
              >
                <Icon
                  icon={allIcons.solid.faCheck}
                  iconClassName="text-4xl text-green-500"
                />
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mb-2 font-bold text-white text-3xl"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Translate content="Order Placed!" />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-green-100 text-lg"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Translate content="Thank you for your purchase" />
            </motion.p>
          </div>

          {/* Order Details Section */}
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="space-y-6"
            >
              {/* Success Message */}
              <div className="text-center">
                <motion.h2
                  className="mb-2 font-semibold text-gray-800 text-xl"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <Translate content="Congratulations!" />
                </motion.h2>
                <p
                  className="text-gray-600"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <Translate content="Your order has been successfully placed and is being processed" />
                </p>
              </div>

              {/* Order Status Steps */}
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex justify-center items-center bg-green-100 rounded-full w-8 h-8">
                    <Icon
                      icon={allIcons.solid.faCheck}
                      iconClassName="text-green-600 text-sm"
                    />
                  </div>
                  <span
                    className="text-gray-700"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <Translate content="Order confirmed" />
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex justify-center items-center bg-blue-100 rounded-full w-8 h-8">
                    <Icon
                      icon={allIcons.solid.faBox}
                      iconClassName="text-blue-600 text-sm"
                    />
                  </div>
                  <span
                    className="text-gray-700"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <Translate content="Preparing for shipment" />
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6, duration: 0.6 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex justify-center items-center bg-yellow-100 rounded-full w-8 h-8">
                    <Icon
                      icon={allIcons.solid.faTruck}
                      iconClassName="text-yellow-600 text-sm"
                    />
                  </div>
                  <span
                    className="text-gray-700"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <Translate content="Ready for delivery" />
                  </span>
                </motion.div>
              </div>

              {/* What's Next Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.6 }}
                className="bg-gray-50 p-4 rounded-lg"
              >
                <h3
                  className="mb-2 font-semibold text-gray-800"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <Translate content="What's next?" />
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-center gap-2">
                    <Icon
                      icon={allIcons.solid.faEnvelope}
                      iconClassName="text-blue-500 text-xs"
                    />
                    <span style={{ fontFamily: "Inter, sans-serif" }}>
                      <Translate content="You'll receive a confirmation email shortly" />
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon
                      icon={allIcons.solid.faBell}
                      iconClassName="text-green-500 text-xs"
                    />
                    <span style={{ fontFamily: "Inter, sans-serif" }}>
                      <Translate content="We'll notify you when your order ships" />
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon
                      icon={allIcons.solid.faMapMarker}
                      iconClassName="text-red-500 text-xs"
                    />
                    <span style={{ fontFamily: "Inter, sans-serif" }}>
                      <Translate content="Track your delivery in real-time" />
                    </span>
                  </li>
                </ul>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.6 }}
                className="space-y-3"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => history.push("/")}
                    className="shadow-lg hover:shadow-xl py-3 rounded-lg w-full font-semibold text-white transition-all duration-200"
                    style={{
                      backgroundColor: BRAND_COLOR,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    <Icon icon={allIcons.solid.faHome} iconClassName="mr-2" />
                    <Translate content="Continue Shopping" />
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => {
                      // Add order tracking functionality here
                      history.push("/");
                    }}
                    className="hover:bg-gray-50 py-3 border border-gray-300 rounded-lg w-full font-medium text-gray-700 transition-all duration-200"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <Icon icon={allIcons.solid.faSearch} iconClassName="mr-2" />
                    <Translate content="Track Order" />
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Floating Success Particles */}
      <div className="z-10 fixed inset-0 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-green-400 rounded-full w-1 h-1"
            initial={{
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 800),
              y:
                Math.random() *
                (typeof window !== "undefined" ? window.innerHeight : 600),
              opacity: 0,
            }}
            animate={{
              y: [
                Math.random() *
                  (typeof window !== "undefined" ? window.innerHeight : 600),
                Math.random() *
                  (typeof window !== "undefined" ? window.innerHeight : 600),
              ],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
};
