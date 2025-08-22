import {
  setTemp,
  getTempFromStore,
  getTemp,
  useCopyState,
  useTemp,
} from "@biqpod/app/ui/hooks";
import { useMemo, useEffect } from "react";
import { Customer, api } from "./api";

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
  setTemp(`cart.${prodId}.count`, count);
};
export const removeCart = (prodId: string) => {
  var fullCart = getTempFromStore<SnapBuy.Order["products"]>("cart");
  var { [prodId]: _, ...rest } = fullCart || {};
  setTemp("cart", rest);
};
export const useCart = () => {
  const carts = getTemp<SnapBuy.Order["products"]>("cart");
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
    return Object.values(carts || {}).reduce(
      (acc, item) => acc + (item?.count || 0),
      0
    );
  }, [carts]);
};

export const clearAllFavorites = () => {
  setTemp("favorites", {});
};

export interface FullCartResult {
  prodId: string;
  count: number;
}
export const useFullCart = (): FullCartResult[] => {
  const carts = useCart();
  const result = useMemo(() => {
    return Object.entries(carts || {}).map(([prodId, r]) => {
      const count = r?.count || 0;
      return {
        prodId,
        count,
      };
    });
  }, [carts]);
  return result;
};
export const deleteCart = () => {
  setTemp("cart", null);
};
export const useCartCount = (prodId: string) => {
  const carts = useCart();
  return useMemo(() => {
    return carts?.[prodId]?.count || 0;
  }, [carts, prodId]);
};
export const useCartLine = (prodId: string) => {
  const carts = useCart();
  return useMemo(() => {
    return carts?.[prodId];
  }, [carts, prodId]);
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
