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
export const getProductPrice = (
  product: SnapBuy.Product,
  isGros = false
): number => {
  return product.type === "single"
    ? (isGros ? product.single?.customer : product.single?.client) || 0
    : Math.min(...(product.multiple?.prices?.map((p) => p.price) || [0]));
};

export const getProductPriceDisplay = (product: SnapBuy.Product): string => {
  const price = getProductPrice(product);
  return product.type === "single" ? `${price} DA` : `From ${price} DA`;
};

// New function to get both customer and client prices when user is signed in
export const getProductPricesForCustomer = (
  product: SnapBuy.Product
): {
  clientPrice: number;
  customerPrice: number;
  clientPriceDisplay: string;
  customerPriceDisplay: string;
  discountAmount: number;
  discountPercentage: number;
  hasDiscount: boolean;
} => {
  if (product.type === "single") {
    const clientPrice = product.single?.client || 0;
    const customerPrice = product.single?.customer || 0;
    const discountAmount = clientPrice - customerPrice;
    const discountPercentage =
      clientPrice > 0 ? Math.round((discountAmount / clientPrice) * 100) : 0;
    const hasDiscount = discountAmount > 0;

    return {
      clientPrice,
      customerPrice,
      clientPriceDisplay: `${clientPrice} DA`,
      customerPriceDisplay: `${customerPrice} DA`,
      discountAmount,
      discountPercentage,
      hasDiscount,
    };
  } else {
    // For multiple type products, use the minimum price for both
    const minPrice = Math.min(
      ...(product.multiple?.prices?.map((p) => p.price) || [0])
    );
    return {
      clientPrice: minPrice,
      customerPrice: minPrice,
      clientPriceDisplay: `From ${minPrice} DA`,
      customerPriceDisplay: `From ${minPrice} DA`,
      discountAmount: 0,
      discountPercentage: 0,
      hasDiscount: false,
    };
  }
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
// Constants for repeated style values - Updated Color Palette
export const BRAND_COLOR_PRIMARY = "#2C5282"; // Dark navy blue
export const BRAND_COLOR_SECONDARY = "#3182CE"; // Medium blue
export const BRAND_COLOR_LIGHT = "#63B3ED"; // Light blue
export const BRAND_COLOR_ACCENT = "#FFF9AF"; // Yellow accent
export const BRAND_COLOR = "#63B3ED"; // Keep for backward compatibility
export const INTER_FONT = "Inter, sans-serif";
export const PLAYFAIR_FONT = "Playfair Display, serif";
export const MONTSERRAT_FONT = "Montserrat, sans-serif";
export const ROBOTO_FONT = "Roboto, sans-serif";

// Enhanced color palette based on the provided design
export const COLOR_PALETTE = {
  primary: {
    dark: "#2C5282", // Darkest blue
    medium: "#3182CE", // Medium blue
    light: "#63B3ED", // Light blue
    accent: "#FFF9AF", // Yellow accent
  },
  gradients: {
    primary: "linear-gradient(135deg, #2C5282 0%, #3182CE 50%, #63B3ED 100%)",
    secondary: "linear-gradient(135deg, #3182CE 0%, #63B3ED 100%)",
    accent: "linear-gradient(135deg, #63B3ED 0%, #FFF9AF 100%)",
    reverse: "linear-gradient(135deg, #63B3ED 0%, #3182CE 50%, #2C5282 100%)",
  },
  states: {
    hover: "#2B6CB0",
    active: "#2A4365",
    disabled: "#A0AEC0",
  },
};
// Common style objects - Updated with new color palette
export const COMMON_STYLES = {
  brandButton: {
    backgroundColor: BRAND_COLOR_SECONDARY,
    borderColor: BRAND_COLOR_SECONDARY,
    fontFamily: INTER_FONT,
  },
  brandButtonPrimary: {
    backgroundColor: BRAND_COLOR_PRIMARY,
    borderColor: BRAND_COLOR_PRIMARY,
    fontFamily: INTER_FONT,
  },
  brandButtonLight: {
    backgroundColor: BRAND_COLOR_LIGHT,
    borderColor: BRAND_COLOR_LIGHT,
    fontFamily: INTER_FONT,
  },
  brandButtonAccent: {
    backgroundColor: BRAND_COLOR_ACCENT,
    borderColor: BRAND_COLOR_ACCENT,
    color: BRAND_COLOR_PRIMARY,
    fontFamily: INTER_FONT,
  },
  brandText: {
    color: BRAND_COLOR_SECONDARY,
    fontFamily: INTER_FONT,
  },
  brandTextPrimary: {
    color: BRAND_COLOR_PRIMARY,
    fontFamily: INTER_FONT,
  },
  brandTextLight: {
    color: BRAND_COLOR_LIGHT,
    fontFamily: INTER_FONT,
  },
  brandTextAccent: {
    color: BRAND_COLOR_ACCENT,
    fontFamily: INTER_FONT,
  },
  interFont: {
    fontFamily: INTER_FONT,
  },
  playfairFont: {
    fontFamily: PLAYFAIR_FONT,
  },
  brandGradient: {
    background: COLOR_PALETTE.gradients.primary,
  },
  brandGradientSecondary: {
    background: COLOR_PALETTE.gradients.secondary,
  },
  brandGradientAccent: {
    background: COLOR_PALETTE.gradients.accent,
  },
  brandGradientReverse: {
    background: COLOR_PALETTE.gradients.reverse,
  },
  brandBackgroundPrimary: {
    backgroundColor: BRAND_COLOR_PRIMARY,
  },
  brandBackgroundSecondary: {
    backgroundColor: BRAND_COLOR_SECONDARY,
  },
  brandBackgroundLight: {
    backgroundColor: BRAND_COLOR_LIGHT,
  },
  brandBackgroundAccent: {
    backgroundColor: BRAND_COLOR_ACCENT,
  },
  // Legacy support
  brandButtonSecondary: {
    backgroundColor: BRAND_COLOR_SECONDARY,
    borderColor: BRAND_COLOR_SECONDARY,
    fontFamily: INTER_FONT,
  },
  brandTextSecondary: {
    color: BRAND_COLOR_SECONDARY,
    fontFamily: INTER_FONT,
  },
  brandGradientDual: {
    background: COLOR_PALETTE.gradients.primary,
  },
  brandBackgroundOnly: {
    backgroundColor: BRAND_COLOR_LIGHT,
  },
};
