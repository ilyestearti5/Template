import { Path, toPath } from "@biqpod/app/ui/apis";
import { getTempFromStore, setTemp } from "@biqpod/app/ui/hooks";
import { Biqpod } from "@biqpod/app/ui/types";
export var apiUrl =
  process.env.NODE_ENV === "production"
    ? "https://developed-nickie-biqpod-7b27f741.koyeb.app/snapbuy"
    : "http://localhost:3000/snapbuy";
const apiKey: string = import.meta.env.VITE_APP_TOKEN;
async function getAccoutToken(): Promise<string | null> {
  // using indexed DB
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SnapBuyDB", 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore("settings", { keyPath: "name" });
    };
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["settings"], "readonly");
      const store = transaction.objectStore("settings");
      const getRequest = store.get("accountToken");
      getRequest.onsuccess = () => {
        resolve(getRequest.result ? getRequest.result.value : null);
      };
      getRequest.onerror = () => {
        reject("Error getting token from IndexedDB");
      };
    };
    request.onerror = () => {
      reject("Error opening IndexedDB");
    };
  });
}
async function setAccountToken(token: string | null) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SnapBuyDB", 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore("settings", { keyPath: "name" });
    };
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["settings"], "readwrite");
      const store = transaction.objectStore("settings");
      store.put({ name: "accountToken", value: token });
      transaction.oncomplete = () => {
        resolve(true);
      };
      transaction.onerror = () => {
        reject("Error setting token in IndexedDB");
      };
    };
    request.onerror = () => {
      reject("Error opening IndexedDB");
    };
  });
}
// Helper function to make API requests
async function apiRequest<T>(
  endpoint: Path,
  body?: any,
  includeContentType: boolean = false
): Promise<T | null> {
  const token = await getAccoutToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }
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
  account: {
    async checkUsername(username: string) {
      const result = await apiRequest<{ exists: boolean }>(
        ["account", "check"],
        {
          username,
        },
        true
      );
      return result?.exists;
    },
    async create(
      username: string,
      password: string,
      information: Partial<Customer>
    ) {
      const result = await apiRequest<{ token?: string }>(
        ["account", "create"],
        {
          username,
          password,
          ...information,
        },
        true
      );
      if (result?.token) {
        setAccountToken(result.token);
      }
    },
    async me() {
      var token = await getAccoutToken();
      if (token) {
        const response = await apiRequest<Customer>(["account", "me"]);
        return response;
      }
    },
    async login(username: string, password: string) {
      const result = await apiRequest<{ token?: string }>(
        ["account", "login"],
        {
          username,
          password,
        },
        true
      );
      if (result?.token) {
        setAccountToken(result.token);
      }
    },
    async changePassword(oldPassword: string, newPassword: string) {
      var token = await getAccoutToken();
      if (token) {
        await apiRequest(
          ["account", "change-password"],
          {
            oldPassword,
            newPassword,
          },
          true
        );
      }
    },
    onUserDetect(callback: (token?: string, customer?: Customer) => void) {
      const request = indexedDB.open("SnapBuyDB", 1);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const storeName = "settings";
        const key = "accountToken";
        let lastToken: string | null = null;
        // Poll every 1s
        setInterval(async () => {
          const tx = db.transaction([storeName], "readonly");
          const store = tx.objectStore(storeName);
          const getRequest = store.get(key);
          getRequest.onsuccess = async () => {
            const storedToken: string | null = getRequest.result
              ? getRequest.result.value
              : null;
            const currentToken = await getAccoutToken();
            if (storedToken !== lastToken) {
              lastToken = storedToken;
              const response = await this.me();
              callback(storedToken || undefined, response || undefined);
            }
            // Optionally also compare with currentToken
            if (storedToken && storedToken !== currentToken) {
              const response = await this.me();
              callback(storedToken || undefined, response || undefined);
            }
          };
        }, 1000);
      };
    },
    async logout() {
      await setAccountToken(null);
    },
    async delete(password: string) {
      var token = await getAccoutToken();
      if (token) {
        await apiRequest(
          ["account", "delete"],
          {
            password,
          },
          true
        );
        await setAccountToken(null);
      }
    },
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
export interface Customer {
  username: string;
  createdAt: number;
  status: "pending" | "rejected" | "accepted";
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  meteData: Record<string, any>;
}
