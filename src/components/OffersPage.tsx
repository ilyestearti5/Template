import { allIcons } from "@biqpod/app/ui/apis";
import { Translate, Icon } from "@biqpod/app/ui/components";
import { useAsyncMemo } from "@biqpod/app/ui/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useHistory } from "react-router";
import { api } from "../api";
import { Button } from "./Custom";
import { Breadcrumb } from "./Breadcrumb";
import { BRAND_COLOR_PRIMARY, COLOR_PALETTE, icons } from "./utils";

export const OffersPage = () => {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "products">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Fetch all offers
  const offers = useAsyncMemo(async () => {
    return api.getPacks();
  }, []);

  // Filter and sort offers
  const filteredAndSortedOffers = useMemo(() => {
    if (!offers) return [];

    let filtered = [...offers];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = offers.filter((offer) =>
        offer.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort offers
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "price":
          comparison = (a.price || 0) - (b.price || 0);
          break;
        case "products":
          comparison = (a.products?.length || 0) - (b.products?.length || 0);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [offers, searchQuery, sortBy, sortOrder]);

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          {
            label: "Special Offers",
            isTranslatable: true,
          },
        ]}
      />

      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 py-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1
              className="mb-4 font-bold text-gray-900 text-4xl md:text-5xl tracking-wider"
              style={{ fontFamily: "Oswald, sans-serif" }}
            >
              🔥 <Translate content="Special Offers" />
            </h1>
            <p
              className="mx-auto max-w-2xl text-gray-600 text-lg md:text-xl"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Translate content="Discover amazing deals and exclusive packages with incredible savings" />
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters and Search Section */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto px-4 py-6 max-w-7xl">
          <div className="flex lg:flex-row flex-col justify-between items-center gap-4">
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative w-full max-w-md"
            >
              <input
                type="text"
                placeholder="Search offers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-3 pl-12 border border-gray-300 focus:border-transparent border-solid rounded-lg focus:ring-2 focus:ring-blue-500 w-full transition-all"
                style={{ fontFamily: "Inter, sans-serif" }}
              />
              <Icon
                icon={icons.search}
                iconClassName="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </motion.div>

            {/* Sort Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-2"
            >
              <span className="mr-2 font-medium text-gray-600 text-sm">
                <Translate content="Sort by:" />
              </span>
              {[
                { key: "name" as const, label: "Name" },
                { key: "price" as const, label: "Price" },
                { key: "products" as const, label: "Items" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleSortChange(key)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === key
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Translate content={label} />
                  {sortBy === key && (
                    <Icon
                      icon={
                        sortOrder === "asc"
                          ? allIcons.solid.faArrowUp
                          : allIcons.solid.faArrowDown
                      }
                      iconClassName="text-xs"
                    />
                  )}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-gray-600 text-sm"
          >
            <Translate content="Showing" /> {filteredAndSortedOffers.length}{" "}
            <Translate content="of" /> {offers?.length || 0}{" "}
            <Translate content="offers" />
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 py-8 max-w-7xl">
        <AnimatePresence mode="wait">
          {!offers ? (
            /* Loading State */
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-20"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mx-auto mb-4"
                >
                  <Icon
                    icon={allIcons.solid.faSpinner}
                    iconClassName="text-4xl text-blue-500"
                  />
                </motion.div>
                <p className="text-gray-600">
                  <Translate content="Loading offers..." />
                </p>
              </div>
            </motion.div>
          ) : filteredAndSortedOffers.length === 0 ? (
            /* No Offers State */
            <motion.div
              key="no-offers"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-6 bg-white shadow-sm p-12 rounded-xl text-center"
            >
              <div className="bg-gray-100 p-8 rounded-full">
                <Icon
                  icon={allIcons.solid.faTag}
                  iconClassName="text-6xl text-gray-400"
                />
              </div>
              <div>
                <h3 className="mb-2 font-bold text-gray-900 text-2xl">
                  {searchQuery ? (
                    <Translate content="No offers found" />
                  ) : (
                    <Translate content="No offers available" />
                  )}
                </h3>
                <p className="text-gray-600 text-lg">
                  {searchQuery ? (
                    <Translate content="Try adjusting your search terms" />
                  ) : (
                    <Translate content="Check back later for amazing deals" />
                  )}
                </p>
              </div>
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery("")}
                  className="px-6 py-3 rounded-lg font-semibold text-white"
                  style={{ backgroundColor: BRAND_COLOR_PRIMARY }}
                >
                  <Translate content="Clear Search" />
                </Button>
              )}
            </motion.div>
          ) : (
            /* Offers Grid */
            <motion.div
              key="offers-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredAndSortedOffers.map((offer, index) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    y: -5,
                    scale: 1.02,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="group bg-white hover:shadow-xl border border-gray-200 hover:border-blue-300 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    history.push(`/offer/${offer.id}`);
                  }}
                >
                  {/* Offer Header */}
                  <div
                    className="relative p-6 overflow-hidden text-white"
                    style={{
                      background: COLOR_PALETTE.gradients.primary,
                    }}
                  >
                    <motion.div
                      className="top-0 right-0 absolute bg-white opacity-10 rounded-full w-32 h-32"
                      initial={{ scale: 0, x: 50, y: -50 }}
                      whileHover={{ scale: 1.5, x: 20, y: -20 }}
                      transition={{ duration: 0.3 }}
                    />
                    <h3
                      className="z-10 relative mb-3 font-bold text-2xl"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {offer.name}
                    </h3>
                    <div className="z-10 relative flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-3xl">
                          {offer.price} DA
                        </span>
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon icon={icons.tag} iconClassName="text-xl" />
                        </motion.div>
                      </div>
                      <motion.div
                        className="bg-white bg-opacity-20 px-3 py-1 rounded-full"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="font-semibold text-sm">
                          {offer.products?.length || 0}{" "}
                          <Translate content="items" />
                        </span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Offer Details */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-gray-600 text-sm">
                        <Translate content="Total Items:" />{" "}
                        <span className="font-semibold text-gray-900">
                          {offer.products?.reduce(
                            (sum, p) => sum + (p.count || 1),
                            0
                          ) || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <Icon
                          icon={allIcons.solid.faPercent}
                          iconClassName="text-sm"
                        />
                        <span className="font-semibold text-sm">
                          <Translate content="Special Price" />
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className="group-hover:shadow-lg py-3 rounded-lg w-full font-semibold text-white transition-all duration-200"
                        style={{ backgroundColor: BRAND_COLOR_PRIMARY }}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          history.push(`/offer/${offer.id}`);
                        }}
                      >
                        <div className="flex justify-center items-center gap-2">
                          <Icon
                            icon={allIcons.solid.faEye}
                            iconClassName="text-sm"
                          />
                          <Translate content="View Offer Details" />
                          <motion.div
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            whileHover={{ x: 3 }}
                          >
                            <Icon
                              icon={allIcons.solid.faArrowRight}
                              iconClassName="text-sm"
                            />
                          </motion.div>
                        </div>
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back to Home Button */}
        {offers && offers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-center mt-12"
          >
            <Button
              onClick={() => history.push("/")}
              className="hover:bg-gray-50 px-8 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-semibold text-gray-700 transition-all"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Icon icon={allIcons.solid.faArrowLeft} iconClassName="mr-2" />
              <Translate content="Back to Home" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
