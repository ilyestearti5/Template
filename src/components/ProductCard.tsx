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
import { Button } from "./Custom";
import {
  getProductPriceDisplay,
  icons,
  COMMON_STYLES,
  MONTSERRAT_FONT,
  BRAND_COLOR,
} from "./utils";

// Product Card Component with Auto-Sliding Photos
export const ProductCard = ({ product }: { product: SnapBuy.Product }) => {
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
    <div className="bg-gray-100 border border-gray-300 border-solid w-[300px] overflow-hidden transition-all duration-300 cursor-pointer">
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
                // Distance from current photo (for clarity)
                // const left = currentPhotoIndex - index;
                return (
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
          <div className="top-2 left-2 absolute bg-red-500 px-2 py-1 rounded-full font-bold text-white text-xs">
            <Translate content="Limited" />
          </div>
        )}
        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={tw(
            `absolute top-1 p-2 rounded-full transition-all duration-300 hover:scale-110`,
            product.photos?.length && product.photos.length > 1 && "right-12",
            !product.photos?.length ||
              (product.photos.length <= 1 && "right-0"),
            isFavorite ? "text-red-500" : "text-gray-600 hover:text-red-500"
          )}
        >
          <Icon
            icon={
              isFavorite ? allIcons.solid.faHeart : allIcons.regular.faHeart
            }
            iconClassName="text-lg"
          />
        </button>
      </div>
      {/* Product Info */}
      <div className="p-4 border-gray-300 border-t border-solid">
        <h3
          className="mb-2 font-semibold text-gray-800 text-lg line-clamp-2"
          style={COMMON_STYLES.interFont}
        >
          {product.name}
        </h3>
        <div className="flex justify-between items-center">
          <span
            className="font-bold text-xl"
            style={{ fontFamily: MONTSERRAT_FONT, color: BRAND_COLOR }}
          >
            {priceDisplay}
          </span>
          <Button
            className="px-4 py-2 border-2 hover:border-blue-400 rounded-full w-fit text-white text-sm transition-all duration-200"
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
    </div>
  );
};
