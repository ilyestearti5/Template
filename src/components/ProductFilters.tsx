import { allIcons } from "@biqpod/app/ui/apis";
import { EmptyComponent, Icon, Translate } from "@biqpod/app/ui/components";
import { useCopyState } from "@biqpod/app/ui/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useMemo, useCallback } from "react";

// Types for filter values
export interface FilterValues {
  brands: string[];
  sizes: string[];
  colors: string[];
  minPrice: number | "";
  maxPrice: number | "";
  deliveryTypes: string[];
}

export interface FilterOptions {
  brands: SnapBuy.Brand[];
  availableSizes: string[];
  availableColors: string[];
  productCounts?: {
    brands: Record<string, number>;
  };
}

export interface ProductFiltersProps {
  // Filter options data
  options: FilterOptions;

  // Current applied filters
  appliedFilters: FilterValues;

  // Callbacks
  onApplyFilters: (filters: FilterValues) => void;
  onClearAllFilters: () => void;

  // Display options
  isMobile?: boolean;
  showMobileFilters?: boolean;
  onCloseMobileFilters?: () => void;

  // Loading state
  isLoading?: boolean;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  options,
  appliedFilters,
  onApplyFilters,
  onClearAllFilters,
  isMobile = false,
  showMobileFilters = false,
  onCloseMobileFilters,
  isLoading = false,
}) => {
  // Filter expansion states
  const [expandedFilters, setExpandedFilters] = useState<{
    [key: string]: boolean;
  }>({
    brand: false,
    category: false,
    size: false,
    colour: false,
    price: false,
    delivery: false,
  });

  // Pending filters (modified in UI but not yet applied)
  const selectedBrands = useCopyState<string[]>(appliedFilters.brands);
  const selectedSizes = useCopyState<string[]>(appliedFilters.sizes);
  const selectedColors = useCopyState<string[]>(appliedFilters.colors);
  const minPrice = useCopyState<number | "">(appliedFilters.minPrice);
  const maxPrice = useCopyState<number | "">(appliedFilters.maxPrice);
  const selectedDeliveryTypes = useCopyState<string[]>(
    appliedFilters.deliveryTypes
  );

  // Sync pending filters when applied filters change
  useMemo(() => {
    selectedBrands.set(appliedFilters.brands);
    selectedSizes.set(appliedFilters.sizes);
    selectedColors.set(appliedFilters.colors);
    minPrice.set(appliedFilters.minPrice);
    maxPrice.set(appliedFilters.maxPrice);
    selectedDeliveryTypes.set(appliedFilters.deliveryTypes);
  }, [appliedFilters]);

  // Toggle filter expansion
  const toggleFilter = useCallback((filterName: string) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  }, []);

  // Apply filters function
  const handleApplyFilters = useCallback(() => {
    const newFilters: FilterValues = {
      brands: selectedBrands.get,
      sizes: selectedSizes.get,
      colors: selectedColors.get,
      minPrice: minPrice.get,
      maxPrice: maxPrice.get,
      deliveryTypes: selectedDeliveryTypes.get,
    };
    onApplyFilters(newFilters);
  }, [
    selectedBrands.get,
    selectedSizes.get,
    selectedColors.get,
    minPrice.get,
    maxPrice.get,
    selectedDeliveryTypes.get,
    onApplyFilters,
  ]);

  // Clear all filters function
  const handleClearAllFilters = useCallback(() => {
    selectedBrands.set([]);
    selectedSizes.set([]);
    selectedColors.set([]);
    minPrice.set("");
    maxPrice.set("");
    selectedDeliveryTypes.set([]);
    onClearAllFilters();
  }, [onClearAllFilters]);

  // Check if there are pending changes
  const hasPendingChanges = useMemo(() => {
    return (
      JSON.stringify(selectedBrands.get) !==
        JSON.stringify(appliedFilters.brands) ||
      JSON.stringify(selectedSizes.get) !==
        JSON.stringify(appliedFilters.sizes) ||
      JSON.stringify(selectedColors.get) !==
        JSON.stringify(appliedFilters.colors) ||
      minPrice.get !== appliedFilters.minPrice ||
      maxPrice.get !== appliedFilters.maxPrice ||
      JSON.stringify(selectedDeliveryTypes.get) !==
        JSON.stringify(appliedFilters.deliveryTypes)
    );
  }, [
    selectedBrands.get,
    appliedFilters.brands,
    selectedSizes.get,
    appliedFilters.sizes,
    selectedColors.get,
    appliedFilters.colors,
    minPrice.get,
    appliedFilters.minPrice,
    maxPrice.get,
    appliedFilters.maxPrice,
    selectedDeliveryTypes.get,
    appliedFilters.deliveryTypes,
  ]);

  // Toggle handlers
  const toggleBrandFilter = useCallback(
    (brandId: string) => {
      selectedBrands.set((prev) =>
        prev.includes(brandId)
          ? prev.filter((id) => id !== brandId)
          : [...prev, brandId]
      );
    },
    [selectedBrands]
  );

  const toggleSizeFilter = useCallback(
    (size: string) => {
      selectedSizes.set((prev) =>
        prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
      );
    },
    [selectedSizes]
  );

  const toggleColorFilter = useCallback(
    (color: string) => {
      selectedColors.set((prev) =>
        prev.includes(color)
          ? prev.filter((c) => c !== color)
          : [...prev, color]
      );
    },
    [selectedColors]
  );

  const toggleDeliveryFilter = useCallback(
    (deliveryType: string) => {
      selectedDeliveryTypes.set((prev) =>
        prev.includes(deliveryType)
          ? prev.filter((d) => d !== deliveryType)
          : [...prev, deliveryType]
      );
    },
    [selectedDeliveryTypes]
  );

  // Color mapping for common color names
  const colorMap: Record<string, string> = {
    red: "#ef4444",
    blue: "#3b82f6",
    green: "#10b981",
    yellow: "#f59e0b",
    purple: "#8b5cf6",
    pink: "#ec4899",
    black: "#000000",
    white: "#ffffff",
    gray: "#6b7280",
    grey: "#6b7280",
    brown: "#92400e",
    orange: "#ea580c",
    teal: "#0d9488",
    navy: "#1e3a8a",
    maroon: "#7f1d1d",
    lime: "#65a30d",
    cyan: "#0891b2",
    indigo: "#4338ca",
  };

  // Active filter counts
  const activeFilterCounts = useMemo(
    () => ({
      brands: appliedFilters.brands.length,
      sizes: appliedFilters.sizes.length,
      colors: appliedFilters.colors.length,
      price:
        appliedFilters.minPrice !== "" || appliedFilters.maxPrice !== ""
          ? 1
          : 0,
      delivery: appliedFilters.deliveryTypes.length,
    }),
    [appliedFilters]
  );

  const FiltersContent = () => (
    <>
      <h2 className="mb-4 font-bold text-gray-900 text-lg uppercase">
        <Translate content="All Filters" />
      </h2>

      {/* Brand Filter */}
      <div className="mb-4">
        <button
          onClick={() => toggleFilter("brand")}
          className="flex justify-between items-center py-2 w-full font-semibold text-gray-900 hover:text-blue-600 text-left transition-colors"
        >
          <span>
            <Translate content="Brand" />
            {activeFilterCounts.brands > 0 && (
              <span className="bg-blue-100 ml-2 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                {activeFilterCounts.brands}
              </span>
            )}
          </span>
          <Icon
            icon={
              expandedFilters.brand
                ? allIcons.solid.faChevronUp
                : allIcons.solid.faChevronDown
            }
            iconClassName="text-sm transition-transform duration-200"
          />
        </button>
        <AnimatePresence>
          {expandedFilters.brand && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-2 mt-3">
                {options.brands && options.brands.length > 0 ? (
                  <EmptyComponent>
                    {/* Select All / Clear All controls */}
                    <div className="flex justify-between items-center pb-2 border-gray-200 border-b">
                      <button
                        onClick={() =>
                          selectedBrands.set(
                            options.brands.filter((b) => b.id).map((b) => b.id!)
                          )
                        }
                        className="text-blue-600 hover:text-blue-800 text-xs transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => selectedBrands.set([])}
                        className="text-gray-500 hover:text-gray-700 text-xs transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    {options.brands
                      .filter((brand) => brand.id)
                      .map((brand) => {
                        const productCount =
                          options.productCounts?.brands[brand.id!] || 0;
                        return (
                          <label
                            key={brand.id}
                            className="flex justify-between items-center gap-2 hover:bg-gray-50 p-1 rounded cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                className="border-gray-300 rounded"
                                checked={selectedBrands.get.includes(brand.id!)}
                                onChange={() => toggleBrandFilter(brand.id!)}
                              />
                              <span className="text-gray-700 text-sm">
                                {brand.name}
                              </span>
                            </div>
                            <span className="text-gray-500 text-xs">
                              ({productCount})
                            </span>
                          </label>
                        );
                      })}
                  </EmptyComponent>
                ) : (
                  <div className="py-2 text-gray-500 text-sm">
                    {isLoading ? "Loading brands..." : "No brands available"}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Size Filter */}
      <div className="mb-4">
        <button
          onClick={() => toggleFilter("size")}
          className="flex justify-between items-center py-2 w-full font-semibold text-gray-900 hover:text-blue-600 text-left transition-colors"
        >
          <span>
            <Translate content="Size" />
            {activeFilterCounts.sizes > 0 && (
              <span className="bg-blue-100 ml-2 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                {activeFilterCounts.sizes}
              </span>
            )}
          </span>
          <Icon
            icon={
              expandedFilters.size
                ? allIcons.solid.faChevronUp
                : allIcons.solid.faChevronDown
            }
            iconClassName="text-sm transition-transform duration-200"
          />
        </button>
        <AnimatePresence>
          {expandedFilters.size && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="gap-2 grid grid-cols-3 mt-3">
                {options.availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSizeFilter(size)}
                    className={`px-3 py-2 border rounded text-sm text-center transition-colors ${
                      selectedSizes.get.includes(size)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Color Filter */}
      <div className="mb-4">
        <button
          onClick={() => toggleFilter("colour")}
          className="flex justify-between items-center py-2 w-full font-semibold text-gray-900 hover:text-blue-600 text-left transition-colors"
        >
          <span>
            <Translate content="Colour" />
            {activeFilterCounts.colors > 0 && (
              <span className="bg-blue-100 ml-2 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                {activeFilterCounts.colors}
              </span>
            )}
          </span>
          <Icon
            icon={
              expandedFilters.colour
                ? allIcons.solid.faChevronUp
                : allIcons.solid.faChevronDown
            }
            iconClassName="text-sm transition-transform duration-200"
          />
        </button>
        <AnimatePresence>
          {expandedFilters.colour && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="gap-2 grid grid-cols-6 mt-3">
                {options.availableColors.map((colorName) => {
                  const colorValue =
                    colorMap[colorName.toLowerCase()] || "#6b7280";
                  const isSelected = selectedColors.get.includes(colorName);
                  return (
                    <button
                      key={colorName}
                      onClick={() => toggleColorFilter(colorName)}
                      className={`border rounded-full w-8 h-8 transition-all ${
                        isSelected
                          ? "border-blue-600 border-2 shadow-lg"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: colorValue }}
                      title={colorName}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Filter */}
      <div className="mb-4">
        <button
          onClick={() => toggleFilter("price")}
          className="flex justify-between items-center py-2 w-full font-semibold text-gray-900 hover:text-blue-600 text-left transition-colors"
        >
          <span>
            <Translate content="Price" />
            {activeFilterCounts.price > 0 && (
              <span className="bg-blue-100 ml-2 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                1
              </span>
            )}
          </span>
          <Icon
            icon={
              expandedFilters.price
                ? allIcons.solid.faChevronUp
                : allIcons.solid.faChevronDown
            }
            iconClassName="text-sm transition-transform duration-200"
          />
        </button>
        <AnimatePresence>
          {expandedFilters.price && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-3 mt-3">
                <div className="gap-2 grid grid-cols-2">
                  <div>
                    <label className="block mb-1 text-gray-600 text-xs">
                      <Translate content="Min Price (DA)" />
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPrice.get}
                      onChange={(e) =>
                        minPrice.set(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-600 text-xs">
                      <Translate content="Max Price (DA)" />
                    </label>
                    <input
                      type="number"
                      placeholder="∞"
                      value={maxPrice.get}
                      onChange={(e) =>
                        maxPrice.set(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full text-sm"
                    />
                  </div>
                </div>
                {(minPrice.get !== "" || maxPrice.get !== "") && (
                  <button
                    onClick={() => {
                      minPrice.set("");
                      maxPrice.set("");
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xs transition-colors"
                  >
                    Clear Price Filter
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delivery Type Filter */}
      <div className="mb-4">
        <button
          onClick={() => toggleFilter("delivery")}
          className="flex justify-between items-center py-2 w-full font-semibold text-gray-900 hover:text-blue-600 text-left transition-colors"
        >
          <span>
            <Translate content="Delivery Type" />
            {activeFilterCounts.delivery > 0 && (
              <span className="bg-blue-100 ml-2 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                {activeFilterCounts.delivery}
              </span>
            )}
          </span>
          <Icon
            icon={
              expandedFilters.delivery
                ? allIcons.solid.faChevronUp
                : allIcons.solid.faChevronDown
            }
            iconClassName="text-sm transition-transform duration-200"
          />
        </button>
        <AnimatePresence>
          {expandedFilters.delivery && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-2 mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="border-gray-300 rounded"
                    checked={selectedDeliveryTypes.get.includes("free")}
                    onChange={() => toggleDeliveryFilter("free")}
                  />
                  <span className="text-gray-700 text-sm">
                    <Translate content="Free delivery" />
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="border-gray-300 rounded"
                    checked={selectedDeliveryTypes.get.includes("express")}
                    onChange={() => toggleDeliveryFilter("express")}
                  />
                  <span className="text-gray-700 text-sm">
                    <Translate content="Express delivery" />
                  </span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Apply Filter and Clear All Buttons */}
      <div className="space-y-3 mt-8 pt-6 border-gray-200 border-t">
        <button
          onClick={
            isMobile
              ? () => {
                  handleApplyFilters();
                  onCloseMobileFilters?.();
                }
              : handleApplyFilters
          }
          disabled={!hasPendingChanges}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
            hasPendingChanges
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Translate content="Apply Filters" />
          {hasPendingChanges && (
            <span className="opacity-75 ml-2 text-xs">
              (<Translate content="Changes pending" />)
            </span>
          )}
        </button>
        <button
          onClick={
            isMobile
              ? () => {
                  handleClearAllFilters();
                  onCloseMobileFilters?.();
                }
              : handleClearAllFilters
          }
          className="bg-gray-50 hover:bg-gray-100 px-4 py-2 border border-gray-300 hover:border-gray-400 rounded-lg w-full font-medium text-gray-700 hover:text-gray-900 text-sm transition-colors"
        >
          <Translate content="Clear All Filters" />
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="z-50 fixed inset-0 bg-black bg-opacity-50"
            onClick={onCloseMobileFilters}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white w-80 h-full overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Filter Header */}
              <div className="flex justify-between items-center p-4 border-gray-200 border-b">
                <h2 className="font-bold text-gray-900 text-lg uppercase">
                  <Translate content="All Filters" />
                </h2>
                <button
                  onClick={onCloseMobileFilters}
                  className="flex justify-center items-center hover:bg-gray-100 rounded-full w-8 h-8 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Icon icon={allIcons.solid.faTimes} iconClassName="text-sm" />
                </button>
              </div>
              {/* Mobile Filter Content */}
              <div className="p-4">
                <FiltersContent />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Desktop version
  return (
    <aside className="flex-shrink-0 w-64">
      <div className="top-6 sticky bg-white p-6 border border-gray-200 rounded-lg max-h-[calc(100vh-2rem)] overflow-y-auto">
        <FiltersContent />
      </div>
    </aside>
  );
};
