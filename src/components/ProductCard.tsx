import { allIcons } from "@biqpod/app/ui/apis";
import { EmptyComponent, Icon, Translate } from "@biqpod/app/ui/components";
import { tw } from "@biqpod/app/ui/utils";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useFullCart,
  addToCart,
  useIsFavorite,
  toggleFavorite,
  useIsSignedIn,
} from "../hooks";
import { Button } from "./Custom";
import {
  getProductPriceDisplay,
  getProductPricesForCustomer,
  icons,
  COMMON_STYLES,
  MONTSERRAT_FONT,
  BRAND_COLOR,
} from "./utils";
import { useAsyncMemo } from "@biqpod/app/ui/hooks";
import { api } from "../api";

// Product Card Component with Auto-Sliding Photos
export const ProductCard = ({ product }: { product: SnapBuy.Product }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageError, setImageError] = useState<{ [key: number]: boolean }>({});
  const [favoriteClicked, setFavoriteClicked] = useState(false);
  const [cartClicked, setCartClicked] = useState(false);
  const isFavorite = useIsFavorite(product.id!);
  const isSignedIn = useIsSignedIn();

  // Memoized values for performance
  const photos = useMemo(() => product.photos || [], [product.photos]);
  const hasMultiplePhotos = useMemo(() => photos.length > 1, [photos.length]);

  // Get pricing based on authentication state
  const priceDisplay = useMemo(() => {
    if (isSignedIn) {
      return getProductPricesForCustomer(product);
    } else {
      return { single: getProductPriceDisplay(product) };
    }
  }, [product, isSignedIn]);

  // Get current cart count for this product
  const currentCartCount =
    useFullCart().find((item) => item.prodId === product.id)?.count || 0;

  // Fetch brand and store for label
  const brand = useAsyncMemo(async () => {
    if (product.brandId) {
      return await api.getBrand(product.brandId);
    }
    return null;
  }, [product.brandId]);

  const store = useAsyncMemo(async () => {
    return await api.getStore();
  }, []);

  const brandLabel = brand?.name || store?.name || "";

  // Handle image error
  const handleImageError = (index: number) => {
    setImageError((prev) => ({ ...prev, [index]: true }));
  };

  // Handle add to cart with animation
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    if (product.id) {
      setCartClicked(true);
      addToCart(product.id, currentCartCount + 1);
      setTimeout(() => setCartClicked(false), 600);
    }
  };

  // Handle favorite toggle with animation
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    if (product.id) {
      setFavoriteClicked(true);
      toggleFavorite(product.id);
      setTimeout(() => setFavoriteClicked(false), 600);
    }
  };

  // Auto-slide photos every 3 seconds
  useEffect(() => {
    if (!hasMultiplePhotos) return;
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevIndex) =>
        prevIndex === photos.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [photos.length, hasMultiplePhotos]);
  return (
    <motion.div
      className="bg-gray-100 hover:shadow-lg border border-gray-300 border-solid w-[300px] overflow-hidden transition-all duration-300 cursor-pointer"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative">
        {photos.length > 0 ? (
          <div className="relative w-full h-48 overflow-hidden">
            {/* Photo Container */}
            <div
              className="flex h-full transition-transform duration-500 ease-in-out"
              style={{
                width: `${photos.length * 100}%`,
                transform: `translateX(-${
                  currentPhotoIndex * (100 / photos.length)
                }%)`,
              }}
            >
              {photos.map((photo, index) => {
                return (
                  <div
                    key={index}
                    className="flex-shrink-0 w-full h-48"
                    style={{
                      width: `${100 / photos.length}%`,
                    }}
                  >
                    {imageError[index] ? (
                      <div className="flex justify-center items-center bg-gradient-to-br from-gray-200 to-gray-300 w-full h-full">
                        <Icon
                          icon={icons.image}
                          iconClassName="text-4xl text-gray-400"
                        />
                      </div>
                    ) : (
                      <img
                        src={photo}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-contain transition-transform duration-300"
                        onError={() => handleImageError(index)}
                        loading="lazy"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {/* Photo Counter */}
            {hasMultiplePhotos && (
              <div className="top-2 right-2 absolute bg-black/50 px-2 py-1 rounded-full text-white text-xs">
                {currentPhotoIndex + 1}/{photos.length}
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center bg-gradient-to-br from-gray-200 to-gray-300 w-full h-48">
            <Icon icon={icons.image} iconClassName="text-4xl text-gray-400" />
          </div>
        )}
        {/* Limited Badge */}
        {product.limited && (
          <motion.div
            className="top-2 left-2 absolute bg-red-500 px-2 py-1 rounded-full font-bold text-white text-xs"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <Translate content="Limited" />
          </motion.div>
        )}

        {/* Discount Badge for signed-in customers */}
        {isSignedIn &&
          (() => {
            const prices = getProductPricesForCustomer(product);
            return prices.hasDiscount && prices.discountPercentage >= 10 ? (
              <motion.div
                className={`absolute bg-gradient-to-r from-green-500 to-green-600 px-3 py-1 rounded-full font-bold text-white text-xs shadow-lg ${
                  product.limited ? "top-12 left-2" : "top-2 left-2"
                }`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.1 }}
              >
                <Icon
                  icon={allIcons.solid.faTag}
                  iconClassName="text-white mr-1"
                />
                {prices.discountPercentage}% OFF
              </motion.div>
            ) : null;
          })()}
        {/* Favorite Button */}
        <motion.button
          onClick={handleToggleFavorite}
          className={tw(
            `absolute top-1 p-2 rounded-full transition-all duration-300 hover:scale-110`,
            product.photos?.length && product.photos.length > 1 && "right-12",
            !product.photos?.length ||
              (product.photos.length <= 1 && "right-0"),
            isFavorite ? "text-red-500" : "text-gray-600 hover:text-red-500"
          )}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          animate={
            favoriteClicked
              ? {
                  scale: [1, 1.5, 1],
                  rotate: [0, 15, -15, 0],
                  transition: { duration: 0.6 },
                }
              : {}
          }
        >
          <motion.div
            animate={
              isFavorite
                ? {
                    scale: [1, 1.3, 1],
                    transition: { duration: 0.3 },
                  }
                : {}
            }
          >
            <Icon
              icon={
                isFavorite ? allIcons.solid.faHeart : allIcons.regular.faHeart
              }
              iconClassName="text-lg"
            />
          </motion.div>
          {/* Heart particles effect */}
          <AnimatePresence>
            {favoriteClicked && isFavorite && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="top-1/2 left-1/2 absolute bg-red-500 rounded-full w-1 h-1"
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: Math.cos((i * 60 * Math.PI) / 180) * 20,
                      y: Math.sin((i * 60 * Math.PI) / 180) * 20,
                    }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      {/* Product Info */}
      <div className="p-4 border-gray-300 border-t border-solid">
        {brandLabel && (
          <div className="mb-1">
            <span
              className="text-gray-500 text-xs uppercase tracking-wide"
              style={COMMON_STYLES.interFont}
            >
              {brandLabel}
            </span>
          </div>
        )}
        <h3
          className="mb-2 font-semibold text-gray-800 text-lg line-clamp-2"
          style={COMMON_STYLES.interFont}
        >
          {product.name}
        </h3>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            {isSignedIn && "customerPriceDisplay" in priceDisplay ? (
              // Show both customer and client prices when signed in
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span
                    className="font-bold text-lg"
                    style={{ fontFamily: MONTSERRAT_FONT, color: BRAND_COLOR }}
                  >
                    {priceDisplay.customerPriceDisplay}
                  </span>
                  {priceDisplay.hasDiscount && (
                    <span
                      className="px-2 py-1 rounded-full font-semibold text-white text-xs"
                      style={{ backgroundColor: "#10B981" }}
                    >
                      -{priceDisplay.discountPercentage}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-gray-500 text-sm line-through"
                    style={{ fontFamily: MONTSERRAT_FONT }}
                  >
                    {priceDisplay.clientPriceDisplay}
                  </span>
                  <span className="text-gray-400 text-xs">
                    <Translate content="Detail Price" />
                  </span>
                </div>
                {priceDisplay.hasDiscount && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="font-medium text-green-600 text-xs">
                      <Translate content="You save" />:{" "}
                      {priceDisplay.discountAmount} DA
                    </span>
                  </div>
                )}
              </div>
            ) : (
              // Show single price when not signed in
              <span
                className="font-bold text-xl"
                style={{ fontFamily: MONTSERRAT_FONT, color: BRAND_COLOR }}
              >
                {"single" in priceDisplay
                  ? priceDisplay.single
                  : getProductPriceDisplay(product)}
              </span>
            )}
          </div>
          <motion.div
            animate={
              cartClicked
                ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                    transition: { duration: 0.6 },
                  }
                : {}
            }
          >
            <Button
              className="relative px-4 py-2 border-2 rounded-full w-fit overflow-hidden text-white text-sm transition-all duration-200"
              style={{
                backgroundColor: BRAND_COLOR,
              }}
              onClick={handleAddToCart}
            >
              <motion.div
                className="flex items-center"
                animate={
                  cartClicked
                    ? {
                        y: [0, -20, 0],
                        transition: { duration: 0.4 },
                      }
                    : {}
                }
              >
                {currentCartCount > 0 ? (
                  <EmptyComponent>
                    <motion.div
                      animate={
                        cartClicked
                          ? {
                              rotate: [0, 360],
                              transition: { duration: 0.4 },
                            }
                          : {}
                      }
                    >
                      <Icon
                        icon={allIcons.solid.faCheck}
                        iconClassName="text-xs mr-1"
                      />
                    </motion.div>
                    <Translate content="Added" /> ({currentCartCount})
                  </EmptyComponent>
                ) : (
                  <Translate content="Add to Cart" />
                )}
              </motion.div>
              {/* Success ripple effect */}
              <AnimatePresence>
                {cartClicked && (
                  <motion.div
                    className="absolute inset-0 bg-green-400 rounded-full"
                    initial={{ scale: 0, opacity: 0.7 }}
                    animate={{ scale: 4, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
