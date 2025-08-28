import {
  setTemp,
  getTempFromStore,
  getTemp,
  useCopyState,
  useTemp,
} from "@biqpod/app/ui/hooks";
import { useMemo, useEffect } from "react";
import { Customer, api } from "./api";

export { useInfiniteOrders } from "./hooks/useInfiniteProducts";
export function initCustomer() {
  useEffect(() => {
    return api.account.onUserDetect((_, info) => {
      setTemp("customer", info || null);
    });
  }, []);
}
// Authentication functionality
export const useCustomer = () => {
  const customer = useTemp<Customer | null>("customer");
  return customer.get;
};
export const useIsSignedIn = () => {
  const customer = useCustomer();
  return customer !== null;
};
// Cart functionality
export const addToCart = (prodId: string, count: number) => {
  setTemp(`cart.products.${prodId}.count`, count);
};
export const addPackToCart = (pack: SnapBuy.Pack, count: number = 1) => {
  if (pack?.id) {
    setTemp(`cart.packs.${pack.id}.count`, count);
    setTemp(`cart.packs.${pack.id}.packData`, pack);
  }
};
export const removeSingleProductFromCart = (prodId: string) => {
  const fullCart = getTempFromStore<{
    products?: Record<string, { count: number }>;
    packs?: Record<string, { count: number; packData: SnapBuy.Pack }>;
  }>("cart");
  if (fullCart?.products) {
    const { [prodId]: _, ...rest } = fullCart.products;
    setTemp("cart.products", rest);
  }
};
export const removePackFromCart = (packId: string) => {
  const fullCart = getTempFromStore<{
    products?: Record<string, { count: number }>;
    packs?: Record<string, { count: number; packData: SnapBuy.Pack }>;
  }>("cart");
  if (fullCart?.packs) {
    const { [packId]: _, ...rest } = fullCart.packs;
    setTemp("cart.packs", rest);
  }
};
export const getCartCount = (prodId: string): number => {
  const carts = getTempFromStore<{
    products?: Record<string, { count: number }>;
  }>("cart");
  return carts?.products?.[prodId]?.count || 0;
};
export const getPackCartCount = (packId: string): number => {
  const carts = getTempFromStore<{
    packs?: Record<string, { count: number; packData: SnapBuy.Pack }>;
  }>("cart");
  return carts?.packs?.[packId]?.count || 0;
};
export const useIsPackInCart = (pack: SnapBuy.Pack): boolean => {
  const carts = useCart();
  return useMemo(() => {
    if (!pack?.id) return false;
    return (
      !!carts?.packs?.[pack.id] && (carts?.packs?.[pack.id]?.count || 0) > 0
    );
  }, [pack?.id, carts?.packs]);
};
export const getPackCartStatus = (
  pack: SnapBuy.Pack
): { inCart: boolean; totalItemsInCart: number } => {
  const carts = getTempFromStore<{
    packs?: Record<string, { count: number; packData: SnapBuy.Pack }>;
  }>("cart");
  if (!pack?.id) {
    return { inCart: false, totalItemsInCart: 0 };
  }
  const packInCart = carts?.packs?.[pack.id];
  const totalItemsInCart = packInCart?.count || 0;
  return { inCart: totalItemsInCart > 0, totalItemsInCart };
};
export const removeCart = (prodId: string) => {
  removeSingleProductFromCart(prodId);
};
export const useCart = () => {
  const carts = getTemp<{
    products?: Record<string, { count: number }>;
    packs?: Record<string, { count: number; packData: SnapBuy.Pack }>;
  }>("cart");
  return carts;
};
// Favorites functionality
export const addToFavorites = (prodId: string) => {
  setTemp(`favorites.${prodId}`, true);
};
export const removeFromFavorites = (prodId: string) => {
  var fullFavorites = getTempFromStore<Record<string, boolean>>("favorites");
  var { [prodId]: _, ...rest } = fullFavorites || {};
  setTemp("favorites", rest);
};
export const useFavorites = () => {
  const favorites = getTemp<Record<string, boolean>>("favorites");
  return favorites;
};
export const useIsFavorite = (prodId: string) => {
  const favorites = useFavorites();
  return useMemo(() => {
    return favorites?.[prodId] || false;
  }, [favorites, prodId]);
};
export const toggleFavorite = (prodId: string) => {
  const favorites =
    getTempFromStore<Record<string, boolean>>("favorites") || {};
  if (favorites[prodId]) {
    removeFromFavorites(prodId);
  } else {
    addToFavorites(prodId);
  }
};
export const useFavoriteProducts = () => {
  const favorites = useFavorites();
  return useMemo(() => {
    return Object.keys(favorites || {}).filter((prodId) => favorites?.[prodId]);
  }, [favorites]);
};
export const useFavoritesCount = () => {
  const favoriteProducts = useFavoriteProducts();
  return favoriteProducts.length;
};
export const useCartCounts = () => {
  const carts = useCart();
  return useMemo(() => {
    let total = 0;
    // Count individual products
    if (carts?.products) {
      total += Object.values(carts.products).reduce(
        (acc, item) => acc + (item?.count || 0),
        0
      );
    }
    // Count packs
    if (carts?.packs) {
      total += Object.values(carts.packs).reduce(
        (acc, item) => acc + (item?.count || 0),
        0
      );
    }
    return total;
  }, [carts]);
};
export const clearAllFavorites = () => {
  setTemp("favorites", {});
};
export interface FullCartResult {
  prodId: string;
  count: number;
  type: "product";
}
export interface FullPackCartResult {
  packId: string;
  count: number;
  packData: SnapBuy.Pack;
  type: "pack";
}
export type FullCartItem = FullCartResult | FullPackCartResult;
export const useFullCart = (): FullCartResult[] => {
  const carts = useCart();
  const result = useMemo(() => {
    if (!carts?.products) return [];
    return Object.entries(carts.products).map(([prodId, item]) => {
      const count = item?.count || 0;
      return {
        prodId,
        count,
        type: "product" as const,
      };
    });
  }, [carts?.products]);
  return result;
};
export const useFullPackCart = (): FullPackCartResult[] => {
  const carts = useCart();
  const result = useMemo(() => {
    if (!carts?.packs) return [];
    return Object.entries(carts.packs).map(([packId, item]) => {
      return {
        packId,
        count: item?.count || 0,
        packData: item?.packData,
        type: "pack" as const,
      };
    });
  }, [carts?.packs]);
  return result;
};
export const useFullCartItems = (): FullCartItem[] => {
  const products = useFullCart();
  const packs = useFullPackCart();
  return [...products, ...packs];
};
export const deleteCart = () => {
  setTemp("cart", null);
};
export const useCartCount = (prodId: string) => {
  const carts = useCart();
  return useMemo(() => {
    return carts?.products?.[prodId]?.count || 0;
  }, [carts?.products, prodId]);
};
export const useCartLine = (prodId: string) => {
  const carts = useCart();
  return useMemo(() => {
    return carts?.products?.[prodId];
  }, [carts?.products, prodId]);
};
// Initialize storage
export function initCart() {
  const fullCarts = useCart();
  const cartsLoaded = useCopyState(false);
  useEffect(() => {
    const cart = localStorage.getItem("cart");
    try {
      const parsedCart = cart ? JSON.parse(cart) : {};
      setTemp("cart", parsedCart);
    } catch {
    } finally {
      cartsLoaded.set(true);
    }
  }, []);
  useEffect(() => {
    if (cartsLoaded.get) {
      localStorage.setItem("cart", JSON.stringify(fullCarts));
    }
  }, [fullCarts, cartsLoaded.get]);
}
export function initFavorites() {
  const fullFavorites = useFavorites();
  const favoritesLoaded = useCopyState(false);
  useEffect(() => {
    const favorites = localStorage.getItem("favorites");
    try {
      const parsedFavorites = favorites ? JSON.parse(favorites) : {};
      setTemp("favorites", parsedFavorites);
    } catch {}
    favoritesLoaded.set(true);
  }, []);
  useEffect(() => {
    if (favoritesLoaded.get) {
      localStorage.setItem("favorites", JSON.stringify(fullFavorites));
    }
  }, [fullFavorites, favoritesLoaded.get]);
}
