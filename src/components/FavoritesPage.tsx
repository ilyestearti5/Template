import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, Translate } from "@biqpod/app/ui/components";
import { useAsyncMemo } from "@biqpod/app/ui/hooks";
import { allIcons } from "@biqpod/app/ui/apis";
import { api } from "../api";
import { useFavoriteProducts, clearAllFavorites } from "../hooks";
import { ProductCard } from "./ProductCard";
import { Button } from "./Custom";
import { icons, BRAND_COLOR_PRIMARY } from "./utils";
import { Breadcrumb } from "./Breadcrumb";

export const FavoritesPage = () => {
  const history = useHistory();
  const favoriteProductIds = useFavoriteProducts();
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  // Fetch all products to get favorite product details
  const products = useAsyncMemo(async () => {
    return api.getProducts();
  }, []);

  // Filter products to get only favorites
  const favoriteProducts = React.useMemo(() => {
    if (!products || !favoriteProductIds.length) return [];
    return products.filter((product) =>
      favoriteProductIds.includes(product.id!)
    );
  }, [products, favoriteProductIds]);

  // Confirmation dialog handlers
  const handleClearAllClick = () => {
    setShowClearConfirmation(true);
  };

  const confirmClearAll = () => {
    clearAllFavorites();
    setShowClearConfirmation(false);
  };

  const cancelClearAll = () => {
    setShowClearConfirmation(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          {
            label: "My Favorites",
            isTranslatable: true,
          },
        ]}
        className="bg-white"
      />

      {/* Header */}
      <div className="mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className="mb-2 font-bold text-gray-900 text-3xl"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              <Icon
                icon={allIcons.solid.faHeart}
                iconClassName="mr-3 text-red-500"
              />
              <Translate content="My Favorites" />
            </h1>
            <p
              className="text-gray-600"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {favoriteProducts.length === 0 ? (
                <Translate content="No favorite products yet" />
              ) : (
                <>
                  <Translate content="You have" /> {favoriteProducts.length}{" "}
                  <Translate content="favorite product" />
                  {favoriteProducts.length !== 1 ? "s" : ""}
                </>
              )}
            </p>
          </div>

          {favoriteProducts.length > 0 && (
            <div className="flex gap-3">
              <Button
                onClick={() => history.push("/")}
                className="px-6 py-2 border-2 rounded-lg font-medium text-gray-700 hover:text-gray-900 transition-all duration-200"
                style={{
                  fontFamily: "Inter, sans-serif",
                  borderColor: "#e5e7eb",
                  backgroundColor: "white",
                }}
              >
                <Translate content="Continue Shopping" />
              </Button>

              <Button
                onClick={handleClearAllClick}
                className="hover:bg-red-50 px-6 py-2 border-2 rounded-lg font-medium text-red-600 hover:text-red-700 transition-all duration-200"
                style={{
                  fontFamily: "Inter, sans-serif",
                  borderColor: "#ef4444",
                  backgroundColor: "white",
                }}
              >
                <Icon icon={allIcons.solid.faTrash} iconClassName="mr-2" />
                <Translate content="Clear All" />
              </Button>
            </div>
          )}
        </div>

        {/* Favorites Content */}
        {favoriteProducts.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center gap-8 bg-white p-16 rounded-lg text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex justify-center items-center bg-red-50 rounded-full w-24 h-24"
            >
              <Icon
                icon={allIcons.regular.faHeart}
                iconClassName="text-4xl text-red-300"
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              <h2
                className="mb-4 font-bold text-gray-900 text-2xl"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                <Translate content="No Favorites Yet" />
              </h2>
              <p
                className="mb-6 max-w-md text-gray-600 text-lg leading-relaxed"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <Translate content="Start adding products to your favorites by clicking the heart icon on any product." />
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            >
              <Button
                onClick={() => history.push("/")}
                className="shadow-lg hover:shadow-xl px-8 py-3 rounded-lg font-semibold text-white text-lg transition-all duration-200"
                style={{
                  backgroundColor: BRAND_COLOR_PRIMARY,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <Icon icon={icons.search} iconClassName="mr-2" />
                <Translate content="Discover Products" />
              </Button>
            </motion.div>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {favoriteProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  whileHover={{ scale: 1.02 }}
                  className="transition-transform transform"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Quick Actions Section */}
        {favoriteProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white shadow-sm mt-12 p-6 border border-gray-200 rounded-lg"
          >
            <h3
              className="mb-4 font-semibold text-gray-900 text-lg"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Translate content="Quick Actions" />
            </h3>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => {
                  // Add all favorites to cart logic
                }}
                className="shadow-md hover:shadow-lg px-6 py-3 rounded-lg font-medium text-white transition-all duration-200"
                style={{
                  backgroundColor: BRAND_COLOR_PRIMARY,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <Icon icon={icons.shoppingCart} iconClassName="mr-2" />
                <Translate content="Add All to Cart" />
              </Button>

              <Button
                onClick={() => {
                  // Share favorites logic
                  if (navigator.share) {
                    navigator.share({
                      title: "My Favorite Products",
                      text: `Check out my ${favoriteProducts.length} favorite products!`,
                      url: window.location.href,
                    });
                  }
                }}
                className="hover:bg-gray-50 px-6 py-3 border-2 rounded-lg font-medium text-gray-700 hover:text-gray-900 transition-all duration-200"
                style={{
                  fontFamily: "Inter, sans-serif",
                  borderColor: "#e5e7eb",
                  backgroundColor: "white",
                }}
              >
                <Icon icon={icons.share} iconClassName="mr-2" />
                <Translate content="Share Favorites" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Clear All Confirmation Dialog */}
      <AnimatePresence>
        {showClearConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{
                duration: 0.4,
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="bg-white shadow-xl mx-4 p-6 rounded-xl w-full max-w-md"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                  className="flex justify-center items-center bg-red-100 mx-auto mb-4 rounded-full w-12 h-12"
                >
                  <Icon
                    icon={allIcons.solid.faHeart}
                    iconClassName="text-red-600 text-xl"
                  />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="mb-2 font-semibold text-gray-900 text-lg"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <Translate content="Clear All Favorites?" />
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="mb-6 text-gray-600"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <Translate content="Are you sure you want to remove all" />{" "}
                  {favoriteProducts.length}{" "}
                  <Translate content="products from your favorites? This action cannot be undone." />
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="flex space-x-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={cancelClearAll}
                    className="flex-1 hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:text-gray-900 transition-all duration-200"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <Translate content="Cancel" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={confirmClearAll}
                    className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <Icon icon={allIcons.solid.faTrash} iconClassName="mr-2" />
                    <Translate content="Clear All" />
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
