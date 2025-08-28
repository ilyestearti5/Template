import { Path, toPath } from "@biqpod/app/ui/apis";
import { useAsyncMemo } from "@biqpod/app/ui/hooks";
import fcbPixel from "react-facebook-pixel";
import ttq from "tiktok-pixel";
import { useMemo } from "react";
import { Nothing } from "@biqpod/app/ui/types";
import { getProductPrice } from "./components/utils";
// Cache duration: 5 minutes in milliseconds
const CACHE_DURATION = 5 * 60 * 1000;
const CACHE_DB_NAME = "SnapBuyCacheDB";
const CACHE_DB_VERSION = 1;
const CACHE_STORE_NAME = "apiCache";
// Helper function to check IndexedDB support
function isIndexedDBSupported(): boolean {
  try {
    return typeof indexedDB !== "undefined" && indexedDB !== null;
  } catch (error) {
    console.warn("IndexedDB not supported:", error);
    return false;
  }
}
// Helper function to handle database version conflicts
function handleDatabaseVersionConflict(dbName: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      const deleteRequest = indexedDB.deleteDatabase(dbName);
      deleteRequest.onsuccess = () => {
        console.log(`Database ${dbName} deleted successfully`);
        resolve();
      };
      deleteRequest.onerror = (event) => {
        console.warn(`Failed to delete database ${dbName}:`, event);
        resolve(); // Continue anyway
      };
      deleteRequest.onblocked = () => {
        console.warn(`Database ${dbName} deletion blocked`);
        resolve(); // Continue anyway
      };
    } catch (error) {
      console.warn(`Error deleting database ${dbName}:`, error);
      resolve();
    }
  });
}
// Utility function to handle IndexedDB corruption recovery
export async function recoverFromDatabaseCorruption() {
  try {
    console.log("Attempting to recover from database corruption...");
    // Delete both databases to force recreation
    await handleDatabaseVersionConflict(CACHE_DB_NAME);
    await handleDatabaseVersionConflict("SnapBuyDB");
    // Clear any existing cache instance
    if (cache["db"]) {
      cache["db"].close();
      cache["db"] = null;
      cache["initPromise"] = null;
    }
    console.log("Database recovery completed");
    return true;
  } catch (error) {
    console.error("Failed to recover from database corruption:", error);
    return false;
  }
}
// IndexedDB cache utilities
class IndexedDBCache {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  async init(): Promise<void> {
    // Check IndexedDB support first
    if (!isIndexedDBSupported()) {
      throw new Error("IndexedDB is not supported in this environment");
    }
    // Prevent multiple initialization attempts
    if (this.initPromise) {
      return this.initPromise;
    }
    if (this.db) {
      return Promise.resolve();
    }
    this.initPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(CACHE_DB_NAME, CACHE_DB_VERSION);
        request.onupgradeneeded = (event) => {
          try {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
              db.createObjectStore(CACHE_STORE_NAME, { keyPath: "key" });
            }
          } catch (error) {
            console.error("Error during database upgrade:", error);
            reject(error);
          }
        };
        request.onsuccess = (event) => {
          try {
            this.db = (event.target as IDBOpenDBRequest).result;
            // Verify the object store exists
            if (!this.db.objectStoreNames.contains(CACHE_STORE_NAME)) {
              console.warn(
                "Object store not found, attempting database recreation"
              );
              this.db.close();
              this.db = null;
              this.initPromise = null;
              // Try to delete and recreate the database
              handleDatabaseVersionConflict(CACHE_DB_NAME).then(() => {
                reject(new Error("Object store not found, database recreated"));
              });
              return;
            }
            // Handle database close events
            this.db.onclose = () => {
              this.db = null;
              this.initPromise = null;
            };
            // Handle database error events
            this.db.onerror = (error) => {
              console.error("Database error:", error);
            };
            resolve();
          } catch (error) {
            console.error("Error in database success handler:", error);
            reject(error);
          }
        };
        request.onerror = (event) => {
          const error = (event.target as IDBOpenDBRequest).error;
          console.error("Error opening cache database:", error);
          this.initPromise = null;
          reject(error || new Error("Error opening cache database"));
        };
        request.onblocked = () => {
          console.warn("Database upgrade blocked, please close other tabs");
        };
      } catch (error) {
        this.initPromise = null;
        reject(error);
      }
    });
    return this.initPromise;
  }
  async get<T>(key: string): Promise<{ data: T; timestamp: number } | null> {
    try {
      await this.init();
      if (!this.db) {
        console.warn("Database not initialized for get operation");
        return null;
      }
      return new Promise((resolve) => {
        try {
          // Verify object store exists before creating transaction
          if (!this.db!.objectStoreNames.contains(CACHE_STORE_NAME)) {
            console.warn("Object store not found for get operation");
            resolve(null);
            return;
          }
          const transaction = this.db!.transaction(
            [CACHE_STORE_NAME],
            "readonly"
          );
          const store = transaction.objectStore(CACHE_STORE_NAME);
          const request = store.get(key);
          request.onsuccess = () => {
            try {
              const result = request.result;
              if (result && Date.now() - result.timestamp < CACHE_DURATION) {
                resolve({ data: result.data, timestamp: result.timestamp });
              } else {
                // Expired, remove it
                if (result) {
                  this.delete(key).catch(console.warn);
                }
                resolve(null);
              }
            } catch (error) {
              console.warn("Error processing get result:", error);
              resolve(null);
            }
          };
          request.onerror = (event) => {
            console.warn("Error reading from cache:", event);
            resolve(null); // Don't reject, just return null
          };
          transaction.onerror = (event) => {
            console.warn("Transaction error in get operation:", event);
            resolve(null);
          };
        } catch (error) {
          console.warn("Error in get operation:", error);
          resolve(null);
        }
      });
    } catch (error) {
      console.warn("Failed to initialize database for get operation:", error);
      return null;
    }
  }
  async set<T>(key: string, data: T): Promise<void> {
    try {
      await this.init();
      if (!this.db) {
        console.warn("Database not initialized for set operation");
        return;
      }
      return new Promise((resolve) => {
        try {
          // Verify object store exists before creating transaction
          if (!this.db!.objectStoreNames.contains(CACHE_STORE_NAME)) {
            console.warn("Object store not found for set operation");
            resolve();
            return;
          }
          const transaction = this.db!.transaction(
            [CACHE_STORE_NAME],
            "readwrite"
          );
          const store = transaction.objectStore(CACHE_STORE_NAME);
          const request = store.put({
            key,
            data,
            timestamp: Date.now(),
          });
          request.onsuccess = () => {
            resolve();
          };
          request.onerror = (event) => {
            console.warn("Error writing to cache:", event);
            resolve(); // Don't throw, just resolve
          };
          transaction.onerror = (event) => {
            console.warn("Transaction error in set operation:", event);
            resolve();
          };
        } catch (error) {
          console.warn("Error in set operation:", error);
          resolve();
        }
      });
    } catch (error) {
      console.warn("Failed to initialize database for set operation:", error);
    }
  }
  async delete(key: string): Promise<void> {
    try {
      await this.init();
      if (!this.db) {
        console.warn("Database not initialized for delete operation");
        return;
      }
      return new Promise((resolve) => {
        try {
          // Verify object store exists before creating transaction
          if (!this.db!.objectStoreNames.contains(CACHE_STORE_NAME)) {
            console.warn("Object store not found for delete operation");
            resolve();
            return;
          }
          const transaction = this.db!.transaction(
            [CACHE_STORE_NAME],
            "readwrite"
          );
          const store = transaction.objectStore(CACHE_STORE_NAME);
          const request = store.delete(key);
          request.onsuccess = () => {
            resolve();
          };
          request.onerror = (event) => {
            console.warn("Error deleting from cache:", event);
            resolve(); // Don't throw, just resolve
          };
          transaction.onerror = (event) => {
            console.warn("Transaction error in delete operation:", event);
            resolve();
          };
        } catch (error) {
          console.warn("Error in delete operation:", error);
          resolve();
        }
      });
    } catch (error) {
      console.warn(
        "Failed to initialize database for delete operation:",
        error
      );
    }
  }
  async clearExpired(): Promise<void> {
    try {
      await this.init();
      if (!this.db) {
        console.warn("Database not initialized for clearExpired operation");
        return;
      }
      return new Promise((resolve) => {
        try {
          // Verify object store exists before creating transaction
          if (!this.db!.objectStoreNames.contains(CACHE_STORE_NAME)) {
            console.warn("Object store not found for clearExpired operation");
            resolve();
            return;
          }
          const transaction = this.db!.transaction(
            [CACHE_STORE_NAME],
            "readwrite"
          );
          const store = transaction.objectStore(CACHE_STORE_NAME);
          const request = store.openCursor();
          request.onsuccess = (event) => {
            try {
              const cursor = (event.target as IDBRequest).result;
              if (cursor) {
                const { timestamp } = cursor.value;
                if (Date.now() - timestamp >= CACHE_DURATION) {
                  cursor.delete();
                }
                cursor.continue();
              } else {
                resolve();
              }
            } catch (error) {
              console.warn("Error processing cursor in clearExpired:", error);
              resolve();
            }
          };
          request.onerror = (event) => {
            console.warn("Error clearing expired cache:", event);
            resolve(); // Don't throw, just resolve
          };
          transaction.onerror = (event) => {
            console.warn("Transaction error in clearExpired operation:", event);
            resolve();
          };
        } catch (error) {
          console.warn("Error in clearExpired operation:", error);
          resolve();
        }
      });
    } catch (error) {
      console.warn(
        "Failed to initialize database for clearExpired operation:",
        error
      );
    }
  }
  async clearAll(): Promise<void> {
    try {
      await this.init();
      if (!this.db) {
        console.warn("Database not initialized for clearAll operation");
        return;
      }
      return new Promise((resolve) => {
        try {
          // Verify object store exists before creating transaction
          if (!this.db!.objectStoreNames.contains(CACHE_STORE_NAME)) {
            console.warn("Object store not found for clearAll operation");
            resolve();
            return;
          }
          const transaction = this.db!.transaction(
            [CACHE_STORE_NAME],
            "readwrite"
          );
          const store = transaction.objectStore(CACHE_STORE_NAME);
          const request = store.clear();
          request.onsuccess = () => {
            resolve();
          };
          request.onerror = (event) => {
            console.warn("Error clearing all cache:", event);
            resolve(); // Don't throw, just resolve
          };
          transaction.onerror = (event) => {
            console.warn("Transaction error in clearAll operation:", event);
            resolve();
          };
        } catch (error) {
          console.warn("Error in clearAll operation:", error);
          resolve();
        }
      });
    } catch (error) {
      console.warn(
        "Failed to initialize database for clearAll operation:",
        error
      );
    }
  }
}
// Global cache instance
const cache = new IndexedDBCache();
// Utility function to clear expired cache entries
export async function clearExpiredCache() {
  try {
    await cache.clearExpired();
  } catch (error) {
    console.warn("Failed to clear expired cache:", error);
  }
}
// Utility function to clear all cache (useful for logout or security)
export async function clearAllCache() {
  try {
    await cache.clearAll();
  } catch (error) {
    console.warn("Failed to clear all cache:", error);
  }
}
// Utility function to get cache statistics (for debugging)
export async function getCacheInfo() {
  try {
    await cache.init();
    if (!cache["db"]) {
      return { totalEntries: 0, dbSize: "Database not initialized" };
    }
    return new Promise<{ totalEntries: number; dbSize: string }>((resolve) => {
      try {
        // Verify object store exists before creating transaction
        if (!cache["db"]!.objectStoreNames.contains(CACHE_STORE_NAME)) {
          resolve({ totalEntries: 0, dbSize: "Object store not found" });
          return;
        }
        const transaction = cache["db"]!.transaction(
          [CACHE_STORE_NAME],
          "readonly"
        );
        const store = transaction.objectStore(CACHE_STORE_NAME);
        const countRequest = store.count();
        countRequest.onsuccess = () => {
          resolve({
            totalEntries: countRequest.result,
            dbSize: "IndexedDB", // IndexedDB doesn't provide size info easily
          });
        };
        countRequest.onerror = (event) => {
          console.warn("Error getting cache info:", event);
          resolve({ totalEntries: 0, dbSize: "Error" });
        };
        transaction.onerror = (event) => {
          console.warn("Transaction error getting cache info:", event);
          resolve({ totalEntries: 0, dbSize: "Transaction Error" });
        };
      } catch (error) {
        console.warn("Error in getCacheInfo operation:", error);
        resolve({ totalEntries: 0, dbSize: "Error" });
      }
    });
  } catch (error) {
    console.warn("Failed to get cache info:", error);
    return { totalEntries: 0, dbSize: "Unknown" };
  }
}
// Cache wrapper function with 5-minute expiration using IndexedDB with fallback
function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  cacheKeyPrefix: string
): (...args: T) => Promise<R> {
  // In-memory fallback cache for when IndexedDB fails
  const memoryCache = new Map<string, { data: R; timestamp: number }>();
  return async (...args: T): Promise<R> => {
    const cacheKey = `${cacheKeyPrefix}.${JSON.stringify(args)}`;
    try {
      // Try to get from IndexedDB cache first
      const cachedData = await cache.get<R>(cacheKey);
      if (cachedData) {
        return cachedData.data;
      }
    } catch (error) {
      console.warn("IndexedDB cache read error:", error);
      // Fallback to memory cache
      const memoryCached = memoryCache.get(cacheKey);
      if (
        memoryCached &&
        Date.now() - memoryCached.timestamp < CACHE_DURATION
      ) {
        return memoryCached.data;
      }
    }
    // Fetch new data
    const result = await fn(...args);
    // Try to cache the result in IndexedDB
    try {
      await cache.set(cacheKey, result);
    } catch (error) {
      console.warn("IndexedDB cache write error:", error);
      // Fallback to memory cache
      memoryCache.set(cacheKey, { data: result, timestamp: Date.now() });
      // Clean up old memory cache entries to prevent memory leaks
      if (memoryCache.size > 50) {
        // Limit memory cache size
        const oldestKeys = Array.from(memoryCache.keys()).slice(0, 10);
        oldestKeys.forEach((key) => memoryCache.delete(key));
      }
    }
    return result;
  };
}
export var apiUrl =
  process.env.NODE_ENV === "production"
    ? "https://developed-nickie-biqpod-7b27f741.koyeb.app/snapbuy"
    : "http://localhost:3000/snapbuy";
const apiKey: string = import.meta.env.VITE_APP_TOKEN;
async function getAccoutToken(): Promise<string | null> {
  // Check IndexedDB support first
  if (!isIndexedDBSupported()) {
    console.warn("IndexedDB not supported, cannot retrieve account token");
    return null;
  }
  // using indexed DB
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open("SnapBuyDB", 1);
      request.onupgradeneeded = (event) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains("settings")) {
            db.createObjectStore("settings", { keyPath: "name" });
          }
        } catch (error) {
          console.error("Error during SnapBuyDB upgrade:", error);
          resolve(null);
        }
      };
      request.onsuccess = (event) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;
          // Verify the object store exists
          if (!db.objectStoreNames.contains("settings")) {
            console.warn("Settings object store not found in SnapBuyDB");
            db.close();
            resolve(null);
            return;
          }
          const transaction = db.transaction(["settings"], "readonly");
          const store = transaction.objectStore("settings");
          const getRequest = store.get("accountToken");
          getRequest.onsuccess = () => {
            try {
              resolve(getRequest.result ? getRequest.result.value : null);
            } catch (error) {
              console.warn("Error processing token result:", error);
              resolve(null);
            }
            db.close();
          };
          getRequest.onerror = (event) => {
            console.warn("Error getting token from IndexedDB:", event);
            db.close();
            resolve(null);
          };
          transaction.onerror = (event) => {
            console.warn("Transaction error getting token:", event);
            db.close();
            resolve(null);
          };
        } catch (error) {
          console.error("Error in getAccountToken success handler:", error);
          resolve(null);
        }
      };
      request.onerror = (event) => {
        console.warn("Error opening SnapBuyDB for token retrieval:", event);
        resolve(null);
      };
      request.onblocked = () => {
        console.warn("SnapBuyDB blocked for token retrieval");
        resolve(null);
      };
    } catch (error) {
      console.error("Error in getAccountToken:", error);
      resolve(null);
    }
  });
}
async function setAccountToken(token: string | null) {
  // Check IndexedDB support first
  if (!isIndexedDBSupported()) {
    console.warn("IndexedDB not supported, cannot set account token");
    return false;
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open("SnapBuyDB", 1);
      request.onupgradeneeded = (event) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains("settings")) {
            db.createObjectStore("settings", { keyPath: "name" });
          }
        } catch (error) {
          console.error(
            "Error during SnapBuyDB upgrade for token setting:",
            error
          );
          resolve(false);
        }
      };
      request.onsuccess = (event) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;
          // Verify the object store exists
          if (!db.objectStoreNames.contains("settings")) {
            console.warn(
              "Settings object store not found in SnapBuyDB for token setting"
            );
            db.close();
            resolve(false);
            return;
          }
          const transaction = db.transaction(["settings"], "readwrite");
          const store = transaction.objectStore("settings");
          if (token === null) {
            // Delete the token
            const deleteRequest = store.delete("accountToken");
            deleteRequest.onsuccess = () => {
              db.close();
              resolve(true);
            };
            deleteRequest.onerror = (event) => {
              console.warn("Error deleting token:", event);
              db.close();
              resolve(false);
            };
          } else {
            // Set the token
            const putRequest = store.put({
              name: "accountToken",
              value: token,
            });
            putRequest.onsuccess = () => {
              db.close();
              resolve(true);
            };
            putRequest.onerror = (event) => {
              console.warn("Error setting token:", event);
              db.close();
              resolve(false);
            };
          }
          transaction.onerror = (event) => {
            console.warn("Transaction error setting token:", event);
            db.close();
            resolve(false);
          };
        } catch (error) {
          console.error("Error in setAccountToken success handler:", error);
          resolve(false);
        }
      };
      request.onerror = (event) => {
        console.warn("Error opening SnapBuyDB for token setting:", event);
        resolve(false);
      };
      request.onblocked = () => {
        console.warn("SnapBuyDB blocked for token setting");
        resolve(false);
      };
    } catch (error) {
      console.error("Error in setAccountToken:", error);
      resolve(false);
    }
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
// Internal API functions without caching
const internalApi = {
  async createOrder(order: CreateOrderOptions) {
    const response = await apiRequest<SnapBuy.Order>(
      "create-order",
      order,
      true
    );
    return response;
  },
  async getStore() {
    const store = await apiRequest<SnapBuy.Store>("store");
    return store;
  },
  async getCollections(limit?: number, startAt?: string) {
    const result = await apiRequest<SnapBuy.Collection[]>(
      "collections",
      { limit, startAt },
      true
    );
    return result || [];
  },
  async getCollection(collectionId: string) {
    const result = await apiRequest<SnapBuy.Collection>(
      `collections/${collectionId}`
    );
    return result;
  },
  async getProducts(limit?: number, startAt?: string) {
    const result = await apiRequest<SnapBuy.Product[]>(
      "products",
      { limit, startAt },
      true
    );
    return result || [];
  },
  async getProduct(id: string) {
    const result = await apiRequest<SnapBuy.Product>(`products/${id}`);
    return result;
  },
  async getAllBrands() {
    const result = await apiRequest<SnapBuy.Brand[]>("brands");
    return result || [];
  },
  async getBrand(id: string) {
    const result = await apiRequest<SnapBuy.Brand>(`brands/${id}`);
    return result;
  },
  async getPacks() {
    const result = await apiRequest<SnapBuy.Pack[]>("packs");
    return result || [];
  },
  async getPack(id: string) {
    const result = await apiRequest<SnapBuy.Pack>(`packs/${id}`);
    return result;
  },
  async getMyOrders(limit: number, startAt: string) {
    const orders = await apiRequest<SnapBuy.Order[]>(
      "orders",
      { limit, startAt },
      true
    );
    return orders;
  },
};
export const api = {
  // createOrder should not be cached as it creates new data
  createOrder: internalApi.createOrder,
  // Apply 5-minute caching to all GET operations
  getStore: withCache(internalApi.getStore, "api.getStore"),
  getCollections: withCache(internalApi.getCollections, "api.getCollections"),
  getCollection: withCache(internalApi.getCollection, "api.getCollection"),
  getProducts: withCache(internalApi.getProducts, "api.getProducts"),
  getProduct: withCache(internalApi.getProduct, "api.getProduct"),
  getAllBrands: withCache(internalApi.getAllBrands, "api.getAllBrands"),
  getBrand: withCache(internalApi.getBrand, "api.getBrand"),
  getPacks: withCache(internalApi.getPacks, "api.getPacks"),
  getPack: withCache(internalApi.getPack, "api.getPack"),
  getMyOrders: withCache(internalApi.getMyOrders, "api.getMyOrders"),
  account: {
    // checkUsername should not be cached as it's used for validation
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
    // create should not be cached as it creates new data
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
    // Apply caching to me() function
    me: async () => {
      var token = await getAccoutToken();
      if (token) {
        const response = await apiRequest<Customer>(["account", "me"]);
        return response;
      }
    },
    // login should not be cached as it creates session
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
    // changePassword should not be cached as it modifies data
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
      // Check IndexedDB support first
      if (!isIndexedDBSupported()) {
        console.warn("IndexedDB not supported, cannot set up user detection");
        return;
      }
      try {
        const request = indexedDB.open("SnapBuyDB", 1);
        request.onupgradeneeded = (event) => {
          try {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains("settings")) {
              db.createObjectStore("settings", { keyPath: "name" });
            }
          } catch (error) {
            console.error(
              "Error during SnapBuyDB upgrade in onUserDetect:",
              error
            );
          }
        };
        request.onsuccess = (event) => {
          try {
            const db = (event.target as IDBOpenDBRequest).result;
            const storeName = "settings";
            const key = "accountToken";
            let lastToken: string | null = null;
            // Verify the object store exists
            if (!db.objectStoreNames.contains(storeName)) {
              console.warn("Settings object store not found in onUserDetect");
              return;
            }
            // Poll every 1s
            const intervalId = setInterval(async () => {
              try {
                const tx = db.transaction([storeName], "readonly");
                const store = tx.objectStore(storeName);
                const getRequest = store.get(key);
                getRequest.onsuccess = async () => {
                  try {
                    const storedToken: string | null = getRequest.result
                      ? getRequest.result.value
                      : null;
                    const currentToken = await getAccoutToken();
                    if (storedToken !== lastToken) {
                      lastToken = storedToken;
                      const response = await api.account.me();
                      callback(storedToken || undefined, response || undefined);
                    }
                    // Optionally also compare with currentToken
                    if (storedToken && storedToken !== currentToken) {
                      const response = await api.account.me();
                      callback(storedToken || undefined, response || undefined);
                    }
                  } catch (error) {
                    console.warn("Error in onUserDetect callback:", error);
                  }
                };
                getRequest.onerror = (event) => {
                  console.warn("Error in onUserDetect polling:", event);
                };
                tx.onerror = (event) => {
                  console.warn("Transaction error in onUserDetect:", event);
                };
              } catch (error) {
                console.warn("Error in onUserDetect interval:", error);
              }
            }, 1000);
            // Clean up on database close
            db.onclose = () => {
              clearInterval(intervalId);
            };
          } catch (error) {
            console.error("Error in onUserDetect success handler:", error);
          }
        };
        request.onerror = (event) => {
          console.warn("Error opening SnapBuyDB in onUserDetect:", event);
        };
        request.onblocked = () => {
          console.warn("SnapBuyDB blocked in onUserDetect");
        };
      } catch (error) {
        console.error("Error in onUserDetect:", error);
      }
    },
    // logout should not be cached as it modifies session
    async logout() {
      await setAccountToken(null);
      // Clear all cached data for security
      await clearAllCache();
    },
    // delete should not be cached as it modifies data
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
// Internal function for address lookup
async function getAddressFromCoordsInternal(lat: number, lon: number) {
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
// Cached version with 5-minute caching
export const getAddressFromCoords = withCache(
  getAddressFromCoordsInternal,
  "api.getAddressFromCoords"
);
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
export function initPixels(store: SnapBuy.Store | Nothing) {
  return useMemo(() => {
    if (!store) {
      return undefined;
    }
    if (store.pixels?.facebook) {
      fcbPixel.init(store.pixels.facebook, undefined, {
        autoConfig: true,
        debug: false,
      });
    }
    if (store.pixels?.tiktok) {
      ttq.init(store.pixels.tiktok, undefined, {
        debug: false,
      });
    }
    return {
      search(value: string) {
        fcbPixel.track("Search", {
          search_string: value,
        });
        // TikTok Pixel tracking
        ttq.track("Search", {
          search_string: value,
        });
      },
      favorite(product: SnapBuy.Product) {
        fcbPixel.track("AddToWishlist", {
          content_ids: [product.id],
          content_name: product.name,
          content_type: "product",
        });
        // TikTok Pixel tracking
        ttq.track("AddToWishlist", {
          content_ids: [product.id],
          content_name: product.name,
          content_type: "product",
        });
      },
      click(tab: string | Nothing) {
        fcbPixel.track("Click", {
          content_type: "tab",
          content_name: tab,
        });
        // TikTok Pixel tracking
        ttq.track("Click", {
          content_type: "tab",
          content_name: tab,
        });
      },
      async view(product: SnapBuy.Product | Nothing) {
        if (!product) {
          return;
        }
        const token = await getAccoutToken();
        const price = getProductPrice(product, !!token, 1);
        fcbPixel.track("ViewContent", {
          content_ids: [product.id],
          content_name: product.name,
          content_type: "product",
          value: price,
          currency: "DZD",
        });
        // TikTok Pixel tracking
        ttq.track("ViewContent", {
          content_ids: [product.id],
          content_name: product.name,
          content_type: "product",
          value: price,
          currency: "DZD",
        });
      },
      async addToCart(product: SnapBuy.Product, count: number) {
        const token = await getAccoutToken();
        const price = getProductPrice(product, !!token, count);
        fcbPixel.track("AddToCart", {
          content_ids: [product.id],
          content_name: product.name,
          content_type: "product",
          value: price,
          currency: "DZD",
          num_items: count,
        });
        // TikTok Pixel tracking
        ttq.track("AddToCart", {
          content_ids: [product.id],
          content_name: product.name,
          content_type: "product",
          value: price,
          currency: "DZD",
          num_items: count,
        });
      },
      submit(tab: string) {
        fcbPixel.track("SubmitApplication", {
          form_id: tab,
        });
        // TikTok Pixel tracking
        ttq.track("SubmitApplication", {
          form_id: tab,
        });
      },
      purchase(order: SnapBuy.Order) {
        const prods = Object.entries(order.products || {}).map(
          ([id, product]) => ({
            id,
            ...product,
          })
        );
        fcbPixel.track("Purchase", {
          content_ids: prods.map((p) => p.id),
          content_name: "Order " + order.id,
          content_type: "product",
          value: order.totalPrice,
          currency: "DZD",
          num_items: prods.length,
        });
        // TikTok Pixel tracking
        ttq.track("Purchase", {
          content_ids: prods.map((p) => p.id),
          content_name: "Order " + order.id,
          content_type: "product",
          value: order.totalPrice,
          currency: "DZD",
          num_items: prods.length,
        });
      },
      async signInAccount(_uid: string) {
        fcbPixel.track("CompleteRegistration", {
          content_name: "Account Signup",
          status: true,
        });
        // TikTok Pixel tracking
        ttq.track("CompleteRegistration", {
          content_name: "Account Signup",
          status: true,
        });
      },
    };
  }, [store]);
}
// Initialize cache cleanup (call this once in your app)
export async function initCacheCleanup() {
  try {
    // Check IndexedDB support first
    if (!isIndexedDBSupported()) {
      console.warn("IndexedDB not supported, cache cleanup disabled");
      return;
    }
    // Initialize the cache database
    await cache.init();
    // Clean up expired cache entries every 5 minutes
    const cleanupInterval = setInterval(async () => {
      try {
        await clearExpiredCache();
      } catch (error) {
        console.warn("Periodic cache cleanup failed:", error);
      }
    }, CACHE_DURATION);
    // Initial cleanup
    await clearExpiredCache();
    // Return cleanup function for proper teardown
    return () => {
      clearInterval(cleanupInterval);
    };
  } catch (error) {
    console.warn("Failed to initialize cache cleanup:", error);
  }
}
// Comprehensive initialization function for IndexedDB and cache setup
export async function initializeApp() {
  try {
    console.log("Initializing app with IndexedDB support...");
    // Check IndexedDB support
    if (!isIndexedDBSupported()) {
      console.warn("IndexedDB not supported, app will run without caching");
      return { success: true, message: "App initialized without IndexedDB" };
    }
    // Try to initialize the cache
    try {
      await cache.init();
      console.log("Cache initialized successfully");
    } catch (error) {
      console.warn("Cache initialization failed, attempting recovery:", error);
      // Attempt to recover from corruption
      const recovered = await recoverFromDatabaseCorruption();
      if (recovered) {
        try {
          await cache.init();
          console.log("Cache initialized successfully after recovery");
        } catch (retryError) {
          console.error(
            "Cache initialization failed even after recovery:",
            retryError
          );
          return { success: false, message: "Cache initialization failed" };
        }
      } else {
        return { success: false, message: "Database recovery failed" };
      }
    }
    // Set up cache cleanup
    const cleanupHandle = await initCacheCleanup();
    // Set up global error handler for IndexedDB errors
    if (typeof window !== "undefined") {
      window.addEventListener("error", (event) => {
        if (event.message && event.message.includes("IndexedDB")) {
          console.error("IndexedDB error detected:", event.error);
          // You could trigger a recovery here if needed
        }
      });
      window.addEventListener("unhandledrejection", (event) => {
        if (event.reason && event.reason.toString().includes("IndexedDB")) {
          console.error("Unhandled IndexedDB promise rejection:", event.reason);
          // You could trigger a recovery here if needed
        }
      });
    }
    console.log("App initialization completed successfully");
    return {
      success: true,
      message: "App initialized with IndexedDB support",
      cleanup: cleanupHandle,
    };
  } catch (error) {
    console.error("App initialization failed:", error);
    return { success: false, message: "App initialization failed", error };
  }
}
export function useStore() {
  return useAsyncMemo(async () => {
    return api.getStore();
  }, []);
}
