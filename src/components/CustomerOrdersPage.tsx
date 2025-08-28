import { allIcons } from "@biqpod/app/ui/apis";
import { Icon, Translate } from "@biqpod/app/ui/components";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useHistory } from "react-router";
import { useInfiniteOrders } from "../hooks/useInfiniteProducts";
import { useIsSignedIn } from "../hooks";
import { OrderCard } from "./OrderCard";
import { Breadcrumb } from "./Breadcrumb";
import { BRAND_COLOR_PRIMARY } from "./utils";
export const CustomerOrdersPage = () => {
  const history = useHistory();
  const isSignedIn = useIsSignedIn();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const observerRef = useRef<HTMLDivElement>(null);
  const { orders, loading, error, hasMore, loadMore, refresh, totalLoaded } =
    useInfiniteOrders(10);

  // Track if we've loaded enough orders for the current filter
  const [maxLoadAttempts, setMaxLoadAttempts] = useState(0);
  const maxAttemptsRef = useRef(0);

  const filteredOrders = orders
    .filter((order) => {
      if (filterStatus === "all") return true;
      return order.status === filterStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (b.createdAt || 0) - (a.createdAt || 0);
        case "date-asc":
          return (a.createdAt || 0) - (b.createdAt || 0);
        case "price-desc":
          return (b.totalPrice || 0) - (a.totalPrice || 0);
        case "price-asc":
          return (a.totalPrice || 0) - (b.totalPrice || 0);
        default:
          return 0;
      }
    });

  // Reset load attempts when filter changes
  useEffect(() => {
    setMaxLoadAttempts(0);
    maxAttemptsRef.current = 0;
  }, [filterStatus]);

  // Track load attempts when orders change but no filtered results found
  useEffect(() => {
    // Only increment attempts when:
    // 1. We have a specific filter (not "all")
    // 2. We have loaded some orders
    // 3. But none match the current filter
    // 4. We're not currently loading
    if (
      filterStatus !== "all" &&
      totalLoaded > 0 &&
      filteredOrders.length === 0 &&
      !loading
    ) {
      const newAttempts = Math.floor(totalLoaded / 10); // Increment based on pages loaded
      if (newAttempts > maxAttemptsRef.current) {
        maxAttemptsRef.current = newAttempts;
        setMaxLoadAttempts(newAttempts);
      }
    }
  }, [totalLoaded, filteredOrders.length, filterStatus, loading]);
  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;

      // Don't load more if not intersecting, no more to load, or currently loading
      if (!target.isIntersecting || !hasMore || loading) return;

      // For "all" filter, always load more if we have orders or it's the first load
      if (filterStatus === "all") {
        loadMore();
        return;
      }

      // For specific filters, be more careful about infinite loading
      const hasFilteredResults = filteredOrders.length > 0;
      const hasLoadedSomeOrders = totalLoaded > 0;
      const notTooManyAttempts = maxLoadAttempts < 3; // Reduced from 5 to 3

      // Load more if we have filtered results, or if we haven't tried too many times
      if (hasFilteredResults || (hasLoadedSomeOrders && notTooManyAttempts)) {
        loadMore();
      }
    },
    [
      hasMore,
      loading,
      loadMore,
      filteredOrders.length,
      filterStatus,
      maxLoadAttempts,
      totalLoaded,
    ]
  );
  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;
    const option = { threshold: 0 };
    const observer = new IntersectionObserver(handleObserver, option);
    observer.observe(element);
    return () => observer.unobserve(element);
  }, [handleObserver]);
  // Filter options
  const statusFilters = [
    { id: "all", label: "All Orders", icon: allIcons.solid.faList },
    { id: "pending", label: "Pending", icon: allIcons.solid.faClock },
    { id: "processing", label: "Processing", icon: allIcons.solid.faCog },
    { id: "delivery", label: "In Delivery", icon: allIcons.solid.faTruck },
    { id: "completed", label: "Completed", icon: allIcons.solid.faCheck },
  ];
  const sortOptions = [
    { id: "date-desc", label: "Newest First" },
    { id: "date-asc", label: "Oldest First" },
    { id: "price-desc", label: "Highest Price" },
    { id: "price-asc", label: "Lowest Price" },
  ];
  if (isSignedIn === false) {
    return (
      <div className="flex justify-center items-center bg-gray-50 min-h-screen">
        <div className="text-center">
          <Icon
            icon={allIcons.solid.faSpinner}
            iconClassName="text-4xl text-gray-400 animate-spin mb-4"
          />
          <p className="text-gray-600">
            <Translate content="Loading..." />
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="relative bg-gray-50 min-h-screen">
      {/* Header */}
      <Breadcrumb
        className="top-0 z-10 sticky border-gray-200 border-b border-solid"
        items={[
          {
            label: "Home",
            onClick: () => history.push("/"),
            isTranslatable: true,
          },
          {
            label: "My Orders",
            onClick: () => history.push("/orders"),
            isTranslatable: true,
          },
        ]}
      />
      {/* Page Header */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="mb-2 font-bold text-gray-900 text-3xl">
                <Translate content="My Orders" />
              </h1>
              <p className="text-gray-600">
                <Translate content="Track and manage your orders" />
              </p>
            </div>
            <button
              onClick={() => {
                setMaxLoadAttempts(0);
                maxAttemptsRef.current = 0;
                refresh();
              }}
              disabled={loading}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 transition-colors duration-200"
            >
              <Icon
                icon={allIcons.solid.faRefresh}
                iconClassName={loading ? "animate-spin" : ""}
              />
              <Translate content="Refresh" />
            </button>
          </div>
        </motion.div>
        {/* Filters and Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white shadow-sm mb-6 p-4 border border-gray-200 rounded-lg"
        >
          <div className="flex lg:flex-row flex-col gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                <Translate content="Filter by Status" />
              </label>
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setFilterStatus(filter.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      filterStatus === filter.id
                        ? "text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    style={{
                      backgroundColor:
                        filterStatus === filter.id
                          ? BRAND_COLOR_PRIMARY
                          : undefined,
                    }}
                  >
                    <Icon icon={filter.icon} iconClassName="text-sm" />
                    <Translate content={filter.label} />
                  </button>
                ))}
              </div>
            </div>
            {/* Sort Options */}
            <div className="lg:w-64">
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                <Translate content="Sort by" />
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 focus:border-transparent border-solid rounded-md focus:ring-2 focus:ring-blue-500 w-full text-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
        {/* Orders List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <OrderCard order={order} />
              </motion.div>
            ))}
          </AnimatePresence>
          {/* Loading More */}
          {loading && filteredOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center py-8"
            >
              <div className="flex items-center gap-2 text-gray-600">
                <Icon
                  icon={allIcons.solid.faSpinner}
                  iconClassName="animate-spin"
                />
                <span>
                  <Translate content="Loading more orders..." />
                </span>
              </div>
            </motion.div>
          )}
          {/* Load More Observer */}
          <div ref={observerRef} className="h-4" />
          {/* No More Orders */}
          {!hasMore && filteredOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center"
            >
              <p className="text-gray-500">
                <Translate content="No more orders to load" />
              </p>
            </motion.div>
          )}
        </div>
        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="py-16 text-center"
          >
            <div className="mx-auto max-w-md">
              <Icon
                icon={allIcons.solid.faShoppingBag}
                iconClassName="text-6xl text-gray-400 mb-4"
              />
              <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                <Translate
                  content={
                    filterStatus === "all"
                      ? "No orders found"
                      : `No ${filterStatus} orders found`
                  }
                />
              </h3>
              <p className="mb-6 text-gray-600">
                <Translate
                  content={
                    filterStatus === "all"
                      ? "You haven't placed any orders yet. Start shopping to see your orders here."
                      : `You don't have any ${filterStatus} orders. Try adjusting your filter.`
                  }
                />
              </p>
              <button
                onClick={() => history.push("/")}
                className="px-6 py-3 rounded-md font-medium text-white transition-colors duration-200"
                style={{ backgroundColor: BRAND_COLOR_PRIMARY }}
              >
                <Translate content="Start Shopping" />
              </button>
            </div>
          </motion.div>
        )}
        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-red-50 p-6 border border-red-200 rounded-lg text-center"
          >
            <Icon
              icon={allIcons.solid.faExclamationTriangle}
              iconClassName="text-red-500 text-2xl mb-2"
            />
            <h3 className="mb-2 font-medium text-red-800">
              <Translate content="Error Loading Orders" />
            </h3>
            <p className="mb-4 text-red-600">{error}</p>
            <button
              onClick={() => {
                setMaxLoadAttempts(0);
                maxAttemptsRef.current = 0;
                refresh();
              }}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md font-medium text-white transition-colors duration-200"
            >
              <Translate content="Try Again" />
            </button>
          </motion.div>
        )}
        {/* Initial Loading */}
        {loading && filteredOrders.length === 0 && (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <Icon
                icon={allIcons.solid.faSpinner}
                iconClassName="text-4xl text-gray-400 animate-spin mb-4"
              />
              <p className="text-gray-600">
                <Translate content="Loading your orders..." />
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
