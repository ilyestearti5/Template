import { allIcons } from "@biqpod/app/ui/apis";
import { EmptyComponent, Icon, Translate } from "@biqpod/app/ui/components";
import { useAsyncMemo, useCopyState } from "@biqpod/app/ui/hooks";
import { fuzzySearch } from "@biqpod/app/ui/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";
import { useHistory, useLocation } from "react-router";
import { api } from "../api";
import { Button } from "./Custom";
import { ProductCard } from "./ProductCard";
import { getProductPrice } from "./utils";
import { Breadcrumb } from "./Breadcrumb";
export const SearchPage = () => {
  const [sortBy, setSortBy] = useState("recommended");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const history = useHistory();
  // Sort options
  const sortOptions = [
    { value: "recommended", label: <Translate content="Recommended" /> },
    {
      value: "price-low-high",
      label: <Translate content="Price Low to High" />,
    },
    {
      value: "price-high-low",
      label: <Translate content="Price High to Low" />,
    },
    { value: "newest", label: <Translate content="Newest" /> },
    { value: "name-a-z", label: <Translate content="Name A to Z" /> },
    { value: "name-z-a", label: <Translate content="Name Z to A" /> },
  ];
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
  // Applied filters (these are used for actual filtering)
  const appliedBrands = useCopyState<string[]>([]);
  const appliedSizes = useCopyState<string[]>([]);
  const appliedColors = useCopyState<string[]>([]);
  const appliedMinPrice = useCopyState<number | "">("");
  const appliedMaxPrice = useCopyState<number | "">("");
  const appliedDeliveryTypes = useCopyState<string[]>([]);
  // Pending filters (these are modified in the UI but not yet applied)
  const selectedBrands = useCopyState<string[]>([]);
  const selectedSizes = useCopyState<string[]>([]);
  const selectedColors = useCopyState<string[]>([]);
  const minPrice = useCopyState<number | "">("");
  const maxPrice = useCopyState<number | "">("");
  const selectedDeliveryTypes = useCopyState<string[]>([]);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const toggleFilter = (filterName: string) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };
  // Apply filters function
  const applyFilters = () => {
    appliedBrands.set(selectedBrands.get);
    appliedSizes.set(selectedSizes.get);
    appliedColors.set(selectedColors.get);
    appliedMinPrice.set(minPrice.get);
    appliedMaxPrice.set(maxPrice.get);
    appliedDeliveryTypes.set(selectedDeliveryTypes.get);
  };
  // Clear all filters function
  const clearAllFilters = () => {
    selectedBrands.set([]);
    selectedSizes.set([]);
    selectedColors.set([]);
    minPrice.set("");
    maxPrice.set("");
    selectedDeliveryTypes.set([]);
    appliedBrands.set([]);
    appliedSizes.set([]);
    appliedColors.set([]);
    appliedMinPrice.set("");
    appliedMaxPrice.set("");
    appliedDeliveryTypes.set([]);
  };
  // Check if there are pending changes
  const hasPendingChanges = useMemo(() => {
    return (
      JSON.stringify(selectedBrands.get) !==
        JSON.stringify(appliedBrands.get) ||
      JSON.stringify(selectedSizes.get) !== JSON.stringify(appliedSizes.get) ||
      JSON.stringify(selectedColors.get) !==
        JSON.stringify(appliedColors.get) ||
      minPrice.get !== appliedMinPrice.get ||
      maxPrice.get !== appliedMaxPrice.get ||
      JSON.stringify(selectedDeliveryTypes.get) !==
        JSON.stringify(appliedDeliveryTypes.get)
    );
  }, [
    selectedBrands.get,
    appliedBrands.get,
    selectedSizes.get,
    appliedSizes.get,
    selectedColors.get,
    appliedColors.get,
    minPrice.get,
    appliedMinPrice.get,
    maxPrice.get,
    appliedMaxPrice.get,
    selectedDeliveryTypes.get,
    appliedDeliveryTypes.get,
  ]);
  const toggleBrandFilter = (brandId: string) => {
    selectedBrands.set((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };
  const toggleSizeFilter = (size: string) => {
    selectedSizes.set((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };
  const toggleColorFilter = (color: string) => {
    selectedColors.set((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };
  const toggleDeliveryFilter = (deliveryType: string) => {
    selectedDeliveryTypes.set((prev) =>
      prev.includes(deliveryType)
        ? prev.filter((d) => d !== deliveryType)
        : [...prev, deliveryType]
    );
  };
  const store = useAsyncMemo(async () => {
    return api.getStore();
  }, []);
  // Fetch products for this store
  const products = useAsyncMemo(async () => {
    return api.getProducts();
  }, []);
  // Fetch brands for this store
  const brands = useAsyncMemo(async () => {
    return api.getAllBrands();
  }, []);
  const loc = useLocation();
  const searchValue = useMemo(() => {
    var url = new URLSearchParams(loc.search);
    var result = url.get("q");
    return result || "";
  }, [loc]);
  // Filtered products based on all applied filters
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let filtered = products.filter((product) =>
      fuzzySearch(searchValue, product.name || "")
    );
    // Filter by brand
    if (appliedBrands.get.length > 0) {
      filtered = filtered.filter((product) =>
        appliedBrands.get.includes(product.brandId || "")
      );
    }
    // Filter by size (from product.metaData.sizes)
    if (appliedSizes.get.length > 0) {
      filtered = filtered.filter((product) => {
        const productSizes = product.metaData?.sizes;
        if (!productSizes || typeof productSizes !== "object") return false;
        if (Array.isArray(productSizes)) {
          return appliedSizes.get.some((size) =>
            (productSizes as string[]).includes(size)
          );
        }
        return false;
      });
    }
    // Filter by color (from product.metaData.colors)
    if (appliedColors.get.length > 0) {
      filtered = filtered.filter((product) => {
        const productColors = product.metaData?.colors;
        if (!productColors || typeof productColors !== "object") return false;
        if (Array.isArray(productColors)) {
          return appliedColors.get.some((color) =>
            (productColors as string[]).some((productColor: string) =>
              productColor.toLowerCase().includes(color.toLowerCase())
            )
          );
        }
        return false;
      });
    }
    // Filter by price range (min/max)
    if (appliedMinPrice.get !== "" || appliedMaxPrice.get !== "") {
      filtered = filtered.filter((product) => {
        const price =
          product.type === "single"
            ? product.single?.client || 0
            : Math.min(
                ...(product.multiple?.prices?.map((p) => p.price) || [0])
              );
        const min =
          appliedMinPrice.get === "" ? 0 : Number(appliedMinPrice.get);
        const max =
          appliedMaxPrice.get === "" ? Infinity : Number(appliedMaxPrice.get);
        return price >= min && price <= max;
      });
    }
    // Filter by delivery type (assuming all products have free delivery for now)
    if (appliedDeliveryTypes.get.length > 0) {
      // For now, all products are considered to have both free and express delivery
      // This could be enhanced with actual delivery data from the product
    }
    // Apply sorting
    switch (sortBy) {
      case "price-low-high":
        filtered = filtered.sort((a, b) => {
          const priceA = getProductPrice(a);
          const priceB = getProductPrice(b);
          return priceA - priceB;
        });
        break;
      case "price-high-low":
        filtered = filtered.sort((a, b) => {
          const priceA = getProductPrice(a);
          const priceB = getProductPrice(b);
          return priceB - priceA;
        });
        break;
      case "newest":
        filtered = filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        break;
      case "name-a-z":
        filtered = filtered.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );
        break;
      case "name-z-a":
        filtered = filtered.sort((a, b) =>
          (b.name || "").localeCompare(a.name || "")
        );
        break;
      case "recommended":
      default:
        // Keep original order (could be enhanced with recommendation algorithm)
        break;
    }
    return filtered;
  }, [
    products,
    searchValue,
    appliedBrands.get,
    appliedSizes.get,
    appliedColors.get,
    appliedMinPrice.get,
    appliedMaxPrice.get,
    appliedDeliveryTypes.get,
    sortBy,
  ]);
  // Get unique sizes and colors from all products for filter options
  const availableSizes = useMemo(() => {
    if (!products) return [];
    const sizes = new Set<string>();
    products.forEach((product) => {
      const productSizes = product.metaData?.sizes;
      if (productSizes && Array.isArray(productSizes)) {
        (productSizes as string[]).forEach((size: string) => sizes.add(size));
      }
    });
    return Array.from(sizes).sort();
  }, [products]);
  const availableColors = useMemo(() => {
    if (!products) return [];
    const colors = new Set<string>();
    products.forEach((product) => {
      const productColors = product.metaData?.colors;
      if (productColors && Array.isArray(productColors)) {
        (productColors as string[]).forEach((color: string) =>
          colors.add(color)
        );
      }
    });
    return Array.from(colors).sort();
  }, [products]);
  return (
    <div className="relative bg-white h-screen overflow-y-auto">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        className="top-0 left-0 z-10 sticky w-full"
        items={[
          {
            label: "Search Results",
            isTranslatable: true,
          },
        ]}
      />
      {/* Main Content */}
      <div className="mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1
              className="mb-2 font-bold text-gray-900 text-3xl"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {store?.name} -{" "}
              <span
                className="lowercase"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {searchValue}
              </span>
            </h1>
            <div className="flex items-center gap-4 text-gray-600 text-sm">
              <span style={{ fontFamily: "Roboto, sans-serif" }}>
                <Translate content="Showing" /> {filteredProducts.length}{" "}
                <Translate content="Results" />
              </span>
            </div>
          </div>
          {/* Mobile Filter Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="sm:hidden flex items-center gap-2 bg-white hover:bg-gray-50 px-4 py-2 border border-gray-300 hover:border-gray-400 rounded-lg font-medium text-gray-700 hover:text-gray-900 text-sm transition-colors"
            >
              <Icon icon={allIcons.solid.faFilter} iconClassName="text-sm" />
              <Translate content="Filters" />
              {(appliedBrands.get.length > 0 ||
                appliedSizes.get.length > 0 ||
                appliedColors.get.length > 0 ||
                appliedMinPrice.get !== "" ||
                appliedMaxPrice.get !== "" ||
                appliedDeliveryTypes.get.length > 0) && (
                <span className="bg-blue-100 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                  {appliedBrands.get.length +
                    appliedSizes.get.length +
                    appliedColors.get.length +
                    (appliedMinPrice.get !== "" || appliedMaxPrice.get !== ""
                      ? 1
                      : 0) +
                    appliedDeliveryTypes.get.length}
                </span>
              )}
            </button>
            {/* Sort Options */}
            <div className="flex items-center gap-4">
              <span
                className="hidden md:inline text-gray-600 text-sm"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <Translate content="Sort by" />
              </span>
              <div ref={sortDropdownRef} className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex justify-between items-center bg-white hover:bg-gray-50 px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 text-sm text-left transition-colors"
                >
                  <span>
                    {sortOptions.find((option) => option.value === sortBy)
                      ?.label || <Translate content="Recommended" />}
                  </span>
                  <Icon
                    icon={
                      showSortDropdown
                        ? allIcons.solid.faChevronUp
                        : allIcons.solid.faChevronDown
                    }
                    iconClassName="text-gray-400 text-xs ml-2 transition-transform duration-200"
                  />
                </button>
                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="top-full left-0 z-50 absolute bg-white shadow-lg mt-1 border border-gray-200 rounded-lg w-48 overflow-hidden"
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                            sortBy === option.value
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{option.label}</span>
                            {sortBy === option.value && (
                              <Icon
                                icon={allIcons.solid.faCheck}
                                iconClassName="text-blue-600 text-xs"
                              />
                            )}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
        <div className="flex md:flex-row max-md:flex-col gap-4 sm:gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="max-md:hidden md:block flex-shrink-0 w-64">
            <div className="top-6 sticky bg-white p-6 border border-gray-200 rounded-lg max-h-[calc(100vh-2rem)] overflow-y-auto">
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
                    {appliedBrands.get.length > 0 && (
                      <span className="bg-blue-100 ml-2 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                        {appliedBrands.get.length}
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
                        {brands && brands.length > 0 ? (
                          <EmptyComponent>
                            {/* Select All / Clear All controls */}
                            <div className="flex justify-between items-center pb-2 border-gray-200 border-b">
                              <button
                                onClick={() =>
                                  selectedBrands.set(brands.map((b) => b.id!))
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
                            {brands.map((brand) => {
                              // Count products for this brand
                              const productCount =
                                products?.filter(
                                  (product) => product.brandId === brand.id
                                ).length || 0;
                              return (
                                <label
                                  key={brand.id}
                                  className="flex justify-between items-center gap-2 hover:bg-gray-50 p-1 rounded cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      className="border-gray-300 rounded"
                                      checked={selectedBrands.get.includes(
                                        brand.id!
                                      )}
                                      onChange={() =>
                                        toggleBrandFilter(brand.id!)
                                      }
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
                            No brands available
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
                    {appliedSizes.get.length > 0 && (
                      <span className="bg-blue-100 ml-2 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                        {appliedSizes.get.length}
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
                        {availableSizes.map((size) => (
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
                    {appliedColors.get.length > 0 && (
                      <span className="bg-blue-100 ml-2 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                        {appliedColors.get.length}
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
                        {availableColors.map((colorName) => {
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
                          const colorValue =
                            colorMap[colorName.toLowerCase()] || "#6b7280";
                          const isSelected =
                            selectedColors.get.includes(colorName);
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
                    {(appliedMinPrice.get !== "" ||
                      appliedMaxPrice.get !== "") && (
                      <span className="bg-blue-100 ml-2 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                        {appliedMinPrice.get !== "" ||
                        appliedMaxPrice.get !== ""
                          ? "1"
                          : "0"}
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
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
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
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
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
                    {appliedDeliveryTypes.get.length > 0 && (
                      <span className="bg-blue-100 ml-2 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                        {appliedDeliveryTypes.get.length}
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
                            checked={selectedDeliveryTypes.get.includes(
                              "express"
                            )}
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
                  onClick={applyFilters}
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
                  onClick={clearAllFilters}
                  className="bg-gray-50 hover:bg-gray-100 px-4 py-2 border border-gray-300 hover:border-gray-400 rounded-lg w-full font-medium text-gray-700 hover:text-gray-900 text-sm transition-colors"
                >
                  <Translate content="Clear All Filters" />
                </button>
              </div>
            </div>
          </aside>
          {/* Mobile Filter Modal */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="z-50 fixed inset-0 bg-black bg-opacity-50"
                onClick={() => setShowMobileFilters(false)}
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
                      onClick={() => setShowMobileFilters(false)}
                      className="flex justify-center items-center hover:bg-gray-100 rounded-full w-8 h-8 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <Icon
                        icon={allIcons.solid.faTimes}
                        iconClassName="text-sm"
                      />
                    </button>
                  </div>
                  {/* Mobile Filter Content - Same as desktop but in mobile container */}
                  <div className="p-4">
                    {/* All filter content will go here - I'll add the same filter structure */}
                    {/* Brand Filter */}
                    <div className="mb-4">
                      <button
                        onClick={() => toggleFilter("brand")}
                        className="flex justify-between items-center py-2 w-full font-semibold text-gray-900 hover:text-blue-600 text-left transition-colors"
                      >
                        <span>
                          <Translate content="Brand" />
                          {appliedBrands.get.length > 0 && (
                            <span className="bg-blue-100 ml-2 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                              {appliedBrands.get.length}
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
                              {brands && brands.length > 0 ? (
                                <>
                                  {/* Select All / Clear All controls */}
                                  <div className="flex justify-between items-center pb-2 border-gray-200 border-b">
                                    <button
                                      onClick={() =>
                                        selectedBrands.set(
                                          brands.map((b) => b.id!)
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
                                  {brands.map((brand) => {
                                    const productCount =
                                      products?.filter(
                                        (product) =>
                                          product.brandId === brand.id
                                      ).length || 0;
                                    return (
                                      <label
                                        key={brand.id}
                                        className="flex justify-between items-center gap-2 hover:bg-gray-50 p-1 rounded cursor-pointer"
                                      >
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            className="border-gray-300 rounded"
                                            checked={selectedBrands.get.includes(
                                              brand.id!
                                            )}
                                            onChange={() =>
                                              toggleBrandFilter(brand.id!)
                                            }
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
                                </>
                              ) : (
                                <div className="py-2 text-gray-500 text-sm">
                                  No brands available
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
                          {appliedSizes.get.length > 0 && (
                            <span className="bg-blue-100 ml-2 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                              {appliedSizes.get.length}
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
                              {availableSizes.map((size) => (
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
                    {/* Price Filter */}
                    <div className="mb-4">
                      <button
                        onClick={() => toggleFilter("price")}
                        className="flex justify-between items-center py-2 w-full font-semibold text-gray-900 hover:text-blue-600 text-left transition-colors"
                      >
                        <span>
                          <Translate content="Price" />
                          {(appliedMinPrice.get !== "" ||
                            appliedMaxPrice.get !== "") && (
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
                            <div className="space-y-3 mt-3 p-2">
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
                                        e.target.value === ""
                                          ? ""
                                          : Number(e.target.value)
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
                                        e.target.value === ""
                                          ? ""
                                          : Number(e.target.value)
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
                    {/* Apply Filters Button for Mobile */}
                    <div className="space-y-3 mt-8 pt-6 border-gray-200 border-t">
                      <button
                        onClick={() => {
                          applyFilters();
                          setShowMobileFilters(false);
                        }}
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
                        onClick={() => {
                          clearAllFilters();
                          setShowMobileFilters(false);
                        }}
                        className="bg-gray-50 hover:bg-gray-100 px-4 py-2 border border-gray-300 hover:border-gray-400 rounded-lg w-full font-medium text-gray-700 hover:text-gray-900 text-sm transition-colors"
                      >
                        <Translate content="Clear All Filters" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Products Grid */}
          <main className="flex-1 w-full md:w-auto">
            {filteredProducts.length === 0 ? (
              /* No Results Found */
              <div className="flex flex-col items-center gap-6 bg-gray-50 p-12 rounded-lg text-center">
                <div className="bg-white shadow-lg p-8 rounded-full">
                  <Icon
                    icon={allIcons.solid.faSearch}
                    iconClassName="text-6xl text-gray-400"
                  />
                </div>
                <div>
                  <h3 className="mb-2 font-bold text-gray-900 text-2xl">
                    <Translate content="No Products Found" />
                  </h3>
                  <p className="text-gray-600 text-lg">
                    <Translate content="Sorry, no products matching" /> "
                    {searchValue}" <Translate content="were found" />
                  </p>
                  <p className="mt-2 text-gray-500 text-sm">
                    <Translate content="Try adjusting your search terms" />
                  </p>
                </div>
                <Button
                  onClick={() => {
                    history.push("/");
                  }}
                  className="px-8 py-3 rounded font-semibold text-white"
                  style={{ backgroundColor: "#89CFF0" }}
                >
                  <Icon
                    icon={allIcons.solid.faArrowLeft}
                    iconClassName="mr-2"
                  />
                  <Translate content="Back to Home" />
                </Button>
              </div>
            ) : (
              /* Products Grid */
              <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
