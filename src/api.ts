import { toPath } from "@biqpod/app/ui/apis";
import { getTempFromStore, setTemp } from "@biqpod/app/ui/hooks";
export var apiUrl = true
  ? "https://developed-nickie-biqpod-7b27f741.koyeb.app/snapbuy"
  : "http://localhost:3000/snapbuy";
const token: string = import.meta.env.VITE_APP_TOKEN;
// Helper function to make API requests
async function apiRequest<T>(
  endpoint: string,
  body?: any,
  includeContentType: boolean = false
): Promise<T | null> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(toPath(apiUrl, endpoint), {
    method: "POST",
    headers,
    ...(body && { body: JSON.stringify(body) }),
  });
  if (response.ok) {
    return response.json();
  }
  return null;
}
export const api = {
  async createOrder(order: CreateOrderOptions) {
    await apiRequest("create-order", order, true);
  },
  async getStore() {
    const result = getTempFromStore<SnapBuy.Store>("store");
    if (result) {
      return result;
    }
    const store = await apiRequest<SnapBuy.Store>("store");
    setTemp("store", store);
    return store;
  },
  async getCollections(limit?: number, startAt?: string) {
    const cacheKey = `collections.${limit || "all"}.${startAt || "start"}`;
    const cached = getTempFromStore<SnapBuy.Collection[]>(cacheKey);
    if (cached) {
      return cached;
    }
    const result = await apiRequest<SnapBuy.Collection[]>(
      "collections",
      { limit, startAt },
      true
    );
    const collections = result || [];
    setTemp(cacheKey, collections);
    // Cache each individual collection
    collections.forEach((collection) => {
      if (collection?.id) {
        setTemp(`collection.${collection.id}`, collection);
      }
    });
    return collections;
  },
  async getCollection(collectionId: string) {
    const cacheKey = `collection.${collectionId}`;
    const cached = getTempFromStore<SnapBuy.Collection>(cacheKey);
    if (cached) {
      return cached;
    }
    const result = await apiRequest<SnapBuy.Collection>(
      `collections/${collectionId}`
    );
    if (result) {
      setTemp(cacheKey, result);
    }
    return result;
  },
  async getProducts(limit?: number, startAt?: string) {
    const cacheKey = `products.${limit || "all"}.${startAt || "start"}`;
    const cached = getTempFromStore<SnapBuy.Product[]>(cacheKey);
    if (cached) {
      return cached;
    }
    const result = await apiRequest<SnapBuy.Product[]>(
      "products",
      { limit, startAt },
      true
    );
    const products = result || [];
    setTemp(cacheKey, products);
    // Cache each individual product
    products.forEach((product) => {
      if (product?.id) {
        setTemp(`product.${product.id}`, product);
      }
    });
    return products;
  },
  async getProduct(id: string) {
    const cacheKey = `product.${id}`;
    const cached = getTempFromStore<SnapBuy.Product>(cacheKey);
    if (cached) {
      return cached;
    }
    const result = await apiRequest<SnapBuy.Product>(`products/${id}`);
    if (result) {
      setTemp(cacheKey, result);
    }
    return result;
  },
  async getAllBrands() {
    const cacheKey = "brands";
    const cached = getTempFromStore<SnapBuy.Brand[]>(cacheKey);
    if (cached) {
      return cached;
    }
    const result = await apiRequest<SnapBuy.Brand[]>("brands");
    const brands = result || [];
    setTemp(cacheKey, brands);
    // Cache each individual brand
    brands.forEach((brand) => {
      if (brand?.id) {
        setTemp(`brand.${brand.id}`, brand);
      }
    });
    return brands;
  },
  async getBrand(id: string) {
    const cacheKey = `brand.${id}`;
    const cached = getTempFromStore<SnapBuy.Brand>(cacheKey);
    if (cached) {
      return cached;
    }
    const result = await apiRequest<SnapBuy.Brand>(`brands/${id}`);
    if (result) {
      setTemp(cacheKey, result);
    }
    return result;
  },
  async getPacks() {
    const cacheKey = "packs";
    const cached = getTempFromStore<SnapBuy.Pack[]>(cacheKey);
    if (cached) {
      return cached;
    }
    const result = await apiRequest<SnapBuy.Pack[]>("packs");
    const packs = result || [];
    setTemp(cacheKey, packs);
    // Cache each individual pack
    packs.forEach((pack) => {
      if (pack?.id) {
        setTemp(`pack.${pack.id}`, pack);
      }
    });
    return packs;
  },
  async getPack(id: string) {
    const cacheKey = `pack.${id}`;
    const cached = getTempFromStore<SnapBuy.Pack>(cacheKey);
    if (cached) {
      return cached;
    }
    const result = await apiRequest<SnapBuy.Pack>(`packs/${id}`);
    if (result) {
      setTemp(cacheKey, result);
    }
    return result;
  },
};
export async function getAddressFromCoords(lat: number, lon: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=fr`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "User-Agent": "biqpod-algeria-app", // You should customize this
    },
  });
  const data = await response.json();
  if (data && data.address) {
    const { state, county, city, town, village } = data.address;
    return {
      fullAddress: data.display_name,
      wilaya: state || county || city || town || village || "Wilaya inconnue",
    };
  } else {
    throw new Error("Adresse non trouvée");
  }
}
