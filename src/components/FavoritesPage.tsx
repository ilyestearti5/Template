import React from "react";
import { useHistory } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, Translate } from "@biqpod/app/ui/components";
import { useAsyncMemo } from "@biqpod/app/ui/hooks";
import { allIcons } from "@biqpod/app/ui/apis";
import { api } from "../api";
import { useFavoriteProducts, clearAllFavorites } from "../hooks";
import { SearchProductCard } from "./SearchProductCard";
import { Button } from "./Custom";
import { icons } from "./utils";

export const FavoritesPage = () => {
  const history = useHistory();
  const favoriteProductIds = useFavoriteProducts();

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

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="bg-white py-3 border-gray-200 border-b">
        <div className="mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <button
              onClick={() => history.push("/")}
              className="hover:text-blue-600 transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Translate content="Home" />
            </button>
            <Icon
              icon={allIcons.solid.faChevronRight}
              iconClassName="text-xs"
            />
            <span
              className="font-medium text-gray-900"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Translate content="My Favorites" />
            </span>
          </div>
        </div>
      </div>

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
                onClick={clearAllFavorites}
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
                  backgroundColor: "#89CFF0",
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
                  <SearchProductCard product={product} />
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
                  favoriteProducts.forEach((product) => {
                    // This would need to be implemented with proper cart logic
                    console.log("Add to cart:", product.id);
                  });
                }}
                className="shadow-md hover:shadow-lg px-6 py-3 rounded-lg font-medium text-white transition-all duration-200"
                style={{
                  backgroundColor: "#89CFF0",
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
    </div>
  );
};
