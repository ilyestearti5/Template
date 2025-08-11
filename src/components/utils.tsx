import { allIcons } from "@biqpod/app/ui/apis";

// Icon symbols using allIcons
export const icons = {
  fire: allIcons.solid.faFire,
  user: allIcons.solid.faUser,
  image: allIcons.solid.faImage,
  star: allIcons.solid.faStar,
  shoppingBag: allIcons.solid.faShoppingBag,
  heart: allIcons.solid.faHeart,
  gift: allIcons.solid.faGift,
  crown: allIcons.solid.faCrown,
  gem: allIcons.solid.faGem,
  globe: allIcons.solid.faGlobe,
  camera: allIcons.solid.faCamera,
  share: allIcons.solid.faShare,
  tag: allIcons.solid.faTag,
  search: allIcons.solid.faSearch,
  shoppingCart: allIcons.solid.faShoppingCart,
};
// Optimized utility functions for repeated logic
export const getProductPrice = (product: SnapBuy.Product): number => {
  return product.type === "single"
    ? product.single?.price || 0
    : Math.min(...(product.multiple?.prices?.map((p) => p.price) || [0]));
};
export const getProductPriceDisplay = (product: SnapBuy.Product): string => {
  const price = getProductPrice(product);
  return product.type === "single" ? `${price} DA` : `From ${price} DA`;
};
export const getDiscountedPrice = (
  originalPrice: number,
  discountRate: number = 1.3
): string => {
  return (originalPrice * discountRate).toFixed(2);
};
// Memoized scroll functions to prevent recreating on every render
export const createScrollFunction = (
  ref: React.RefObject<HTMLDivElement>,
  scrollAmount: number,
  checkFunction: () => void
) => {
  return () => {
    if (ref.current) {
      ref.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkFunction, 300);
    }
  };
};
// Constants for repeated style values
export const BRAND_COLOR = "#89CFF0";
const INTER_FONT = "Inter, sans-serif";
const PLAYFAIR_FONT = "Playfair Display, serif";
export const MONTSERRAT_FONT = "Montserrat, sans-serif";
export const ROBOTO_FONT = "Roboto, sans-serif";
// Common style objects
export const COMMON_STYLES = {
  brandButton: {
    backgroundColor: BRAND_COLOR,
    borderColor: BRAND_COLOR,
    fontFamily: INTER_FONT,
  },
  brandText: {
    color: BRAND_COLOR,
    fontFamily: INTER_FONT,
  },
  interFont: {
    fontFamily: INTER_FONT,
  },
  playfairFont: {
    fontFamily: PLAYFAIR_FONT,
  },
  brandGradient: {
    background: `linear-gradient(to right, ${BRAND_COLOR}, #5DADE2)`,
  },
  brandBackgroundOnly: {
    backgroundColor: BRAND_COLOR,
  },
};
