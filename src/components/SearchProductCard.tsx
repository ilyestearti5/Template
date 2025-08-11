import { allIcons } from "@biqpod/app/ui/apis";
import { Icon, Translate } from "@biqpod/app/ui/components";
import { tw } from "@biqpod/app/ui/utils";
import { useState, useMemo, useEffect } from "react";
import {
  useFullCart,
  addToCart,
  useIsFavorite,
  toggleFavorite,
} from "../hooks";
import { Line, Button } from "./Custom";
import {
  getProductPriceDisplay,
  icons,
  COMMON_STYLES,
  ROBOTO_FONT,
  MONTSERRAT_FONT,
} from "./utils";

// Search Results Product Card Component - Namshi-style compact layout
export const SearchProductCard = ({
  product,
}: {
  product: SnapBuy.Product;
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const isFavorite = useIsFavorite(product.id!);

  // Memoized values for performance
  const photos = useMemo(() => product.photos || [], [product.photos]);
  const hasMultiplePhotos = useMemo(() => photos.length > 1, [photos.length]);
  const priceDisplay = useMemo(
    () => getProductPriceDisplay(product),
    [product]
  );
  // Get current cart count for this product
  const currentCartCount =
    useFullCart().find((item) => item.prodId === product.id)?.count || 0;
  // Handle add to cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    if (product.id) {
      addToCart(product.id, currentCartCount + 1);
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    if (product.id) {
      toggleFavorite(product.id);
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
    <div className="group flex flex-col bg-gray-50 border border-gray-200 border-solid rounded-lg w-full overflow-hidden transition-all duration-300 cursor-pointer">
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
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full h-48"
                  style={{
                    width: `${100 / photos.length}%`,
                  }}
                >
                  <img
                    src={photo}
                    alt={`${product.name} - ${index + 1}`}
                    className="w-full h-full object-contain transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
            {/* Photo Counter */}
            {hasMultiplePhotos && (
              <div className="top-2 left-2 absolute bg-black/70 px-2 py-1 rounded text-white text-xs">
                {currentPhotoIndex + 1}/{photos.length}
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center bg-gray-100 w-full h-48">
            <Icon icon={icons.image} iconClassName="text-3xl text-gray-400" />
          </div>
        )}
        {/* Limited Badge */}
        {product.limited && (
          <div className="top-2 right-2 absolute bg-red-500 px-2 py-1 rounded font-bold text-white text-xs">
            <Translate content="Limited" />
          </div>
        )}
        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className="right-2 bottom-2 absolute hover:bg-white/80 p-1 rounded-full hover:scale-110 transition-all duration-200"
        >
          <Icon
            icon={
              isFavorite ? allIcons.solid.faHeart : allIcons.regular.faHeart
            }
            iconClassName={tw(
              "text-sm transition-colors duration-300",
              isFavorite ? "text-red-500" : "text-gray-600 hover:text-red-500"
            )}
          />
        </button>
      </div>
      <div>
        <Line />
      </div>
      {/* Product Info */}
      <div className="p-3">
        {/* Brand/Category */}
        <div className="mb-1">
          <span
            className="text-gray-500 text-xs uppercase tracking-wide"
            style={COMMON_STYLES.interFont}
          >
            SnapBuy
          </span>
        </div>
        {/* Product Name */}
        <h3
          className="mb-2 font-medium text-gray-900 group-hover:text-[#89CFF0] text-sm line-clamp-2 transition-colors duration-200"
          style={{ fontFamily: ROBOTO_FONT }}
        >
          {product.name}
        </h3>
        {/* Price */}
        <div className="flex items-center gap-1.5 mb-2">
          <span
            className="font-bold text-gray-900 text-base"
            style={{ fontFamily: MONTSERRAT_FONT }}
          >
            {priceDisplay}
          </span>
        </div>
        {/* Free Delivery Badge */}
        <div className="flex items-center gap-1 mb-2 text-green-600 text-xs">
          <Icon icon={allIcons.solid.faTruck} iconClassName="text-xs" />
          <span style={COMMON_STYLES.interFont}>
            <Translate content="Free Delivery" />
          </span>
        </div>
        {/* Action Button */}
        <Button
          className="px-3 py-1.5 border-2 hover:border-blue-400 rounded w-full font-medium text-white text-xs transition-colors duration-200"
          style={COMMON_STYLES.brandButton}
          onClick={handleAddToCart}
        >
          {currentCartCount > 0 ? (
            <>
              <Icon
                icon={allIcons.solid.faCheck}
                iconClassName="text-xs mr-1"
              />
              <Translate content="Added" /> ({currentCartCount})
            </>
          ) : (
            <Translate content="Add to Cart" />
          )}
        </Button>
      </div>
    </div>
  );
};
