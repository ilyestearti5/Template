import { allIcons } from "@biqpod/app/ui/apis";
import { Icon, Translate } from "@biqpod/app/ui/components";
import { useAsyncMemo } from "@biqpod/app/ui/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";
import { useHistory, useLocation } from "react-router";
import { api, initPixels } from "../api";
import { Button } from "./Custom";
import { ProductCard } from "./ProductCard";
import { Breadcrumb } from "./Breadcrumb";
import { ProductFilters } from "./ProductFilters";
import { useProductFilters } from "../hooks/useProductFilters";
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

  // Fetch data
  const store = useAsyncMemo(async () => {
    return api.getStore();
  }, []);

  const products = useAsyncMemo(async () => {
    return api.getProducts();
  }, []);

  const brands = useAsyncMemo(async () => {
    return api.getAllBrands();
  }, []);

  const loc = useLocation();
  const searchValue = useMemo(() => {
    var url = new URLSearchParams(loc.search);
    var result = url.get("q");
    return result || "";
  }, [loc]);

  const pixels = initPixels(store);
  useEffect(() => {
    pixels?.search(searchValue);
  }, [pixels, searchValue]);

  // Use the optimized filtering hook
  const {
    appliedFilters,
    setAppliedFilters,
    clearAllFilters,
    filteredProducts,
    filterOptions,
  } = useProductFilters({
    products: products || [],
    searchValue,
    sortBy,
  });

  // Enhanced filter options with brands data
  const enhancedFilterOptions = useMemo(
    () => ({
      ...filterOptions,
      brands: brands || [],
      productCounts: {
        brands: (products || []).reduce((acc, product) => {
          if (product.brandId) {
            acc[product.brandId] = (acc[product.brandId] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>),
      },
    }),
    [filterOptions, brands, products]
  );

  // Calculate active filters count for mobile button
  const activeFiltersCount = useMemo(() => {
    return (
      appliedFilters.brands.length +
      appliedFilters.sizes.length +
      appliedFilters.colors.length +
      (appliedFilters.minPrice !== "" || appliedFilters.maxPrice !== ""
        ? 1
        : 0) +
      appliedFilters.deliveryTypes.length
    );
  }, [appliedFilters]);
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
              {activeFiltersCount > 0 && (
                <span className="bg-blue-100 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                  {activeFiltersCount}
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
          {/* Desktop Filters */}
          <div className="max-md:hidden md:block">
            <ProductFilters
              options={enhancedFilterOptions}
              appliedFilters={appliedFilters}
              onApplyFilters={setAppliedFilters}
              onClearAllFilters={clearAllFilters}
              isLoading={!products || !brands}
            />
          </div>

          {/* Mobile Filters */}
          <ProductFilters
            options={enhancedFilterOptions}
            appliedFilters={appliedFilters}
            onApplyFilters={setAppliedFilters}
            onClearAllFilters={clearAllFilters}
            isMobile={true}
            showMobileFilters={showMobileFilters}
            onCloseMobileFilters={() => setShowMobileFilters(false)}
            isLoading={!products || !brands}
          />

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
