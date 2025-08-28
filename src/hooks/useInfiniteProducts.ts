import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api";

export interface UseInfiniteOrdersResult {
  orders: SnapBuy.Order[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  totalLoaded: number;
}

export const useInfiniteOrders = (
  pageSize: number = 10
): UseInfiniteOrdersResult => {
  const [orders, setOrders] = useState<SnapBuy.Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastOrderId, setLastOrderId] = useState<string>("");

  // Use refs to store the latest values without causing re-renders
  const lastOrderIdRef = useRef<string>("");
  const pageSizeRef = useRef<number>(pageSize);

  // Update refs when values change
  useEffect(() => {
    lastOrderIdRef.current = lastOrderId;
  }, [lastOrderId]);

  useEffect(() => {
    pageSizeRef.current = pageSize;
  }, [pageSize]);

  const loadOrders = useCallback(
    async (isRefresh: boolean = false) => {
      setLoading(true);
      setError(null);

      try {
        const startAt = isRefresh ? "" : lastOrderIdRef.current;
        const newOrders = await api.getMyOrders(pageSizeRef.current, startAt);

        if (newOrders) {
          if (isRefresh) {
            setOrders(newOrders);
          } else {
            setOrders((prev) => [...prev, ...newOrders]);
          }

          // Update pagination state
          setHasMore(newOrders.length === pageSizeRef.current);
          if (newOrders.length > 0) {
            setLastOrderId(newOrders[newOrders.length - 1].id || "");
          } else if (isRefresh) {
            // If refresh returns no orders, reset lastOrderId
            setLastOrderId("");
          }
        } else {
          setHasMore(false);
          if (isRefresh) {
            setLastOrderId("");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    },
    [] // No dependencies to prevent infinite loops
  );

  const loadMore = useCallback(() => loadOrders(false), [loadOrders]);

  const refresh = useCallback(() => {
    setLastOrderId("");
    return loadOrders(true);
  }, [loadOrders]);

  // Initial load
  useEffect(() => {
    loadOrders(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    orders,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    totalLoaded: orders.length,
  };
};
