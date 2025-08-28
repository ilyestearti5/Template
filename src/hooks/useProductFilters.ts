import { useMemo, useCallback } from "react";
import { useCopyState } from "@biqpod/app/ui/hooks";
import { fuzzySearch } from "@biqpod/app/ui/utils";
import { getProductPrice } from "../components/utils";

// Types
export interface FilterValues {
  brands: string[];
  sizes: string[];
  colors: string[];
  minPrice: number | "";
  maxPrice: number | "";
  deliveryTypes: string[];
}

export interface UseProductFiltersProps {
  products: SnapBuy.Product[];
  searchValue: string;
  sortBy: string;
}

export interface UseProductFiltersReturn {
  appliedFilters: FilterValues;
  setAppliedFilters: (filters: FilterValues) => void;
  clearAllFilters: () => void;
  filteredProducts: SnapBuy.Product[];
  filterOptions: {
    brands: SnapBuy.Brand[];
    availableSizes: string[];
    availableColors: string[];
    productCounts: {
      brands: Record<string, number>;
    };
  };
}

export const useProductFilters = ({
  products,
  searchValue,
  sortBy,
}: UseProductFiltersProps): UseProductFiltersReturn => {
  // Applied filters state
  const appliedBrands = useCopyState<string[]>([]);
  const appliedSizes = useCopyState<string[]>([]);
  const appliedColors = useCopyState<string[]>([]);
  const appliedMinPrice = useCopyState<number | "">("");
  const appliedMaxPrice = useCopyState<number | "">("");
  const appliedDeliveryTypes = useCopyState<string[]>([]);

  // Create applied filters object
  const appliedFilters: FilterValues = useMemo(
    () => ({
      brands: appliedBrands.get,
      sizes: appliedSizes.get,
      colors: appliedColors.get,
      minPrice: appliedMinPrice.get,
      maxPrice: appliedMaxPrice.get,
      deliveryTypes: appliedDeliveryTypes.get,
    }),
    [
      appliedBrands.get,
      appliedSizes.get,
      appliedColors.get,
      appliedMinPrice.get,
      appliedMaxPrice.get,
      appliedDeliveryTypes.get,
    ]
  );

  // Set applied filters
  const setAppliedFilters = useCallback(
    (filters: FilterValues) => {
      appliedBrands.set(filters.brands);
      appliedSizes.set(filters.sizes);
      appliedColors.set(filters.colors);
      appliedMinPrice.set(filters.minPrice);
      appliedMaxPrice.set(filters.maxPrice);
      appliedDeliveryTypes.set(filters.deliveryTypes);
    },
    [
      appliedBrands,
      appliedSizes,
      appliedColors,
      appliedMinPrice,
      appliedMaxPrice,
      appliedDeliveryTypes,
    ]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    appliedBrands.set([]);
    appliedSizes.set([]);
    appliedColors.set([]);
    appliedMinPrice.set("");
    appliedMaxPrice.set("");
    appliedDeliveryTypes.set([]);
  }, [
    appliedBrands,
    appliedSizes,
    appliedColors,
    appliedMinPrice,
    appliedMaxPrice,
    appliedDeliveryTypes,
  ]);

  // Get unique sizes and colors from all products for filter options
  const availableSizes = useMemo(() => {
    if (!products) return [];
    const sizes = new Set<string>();
    products.forEach((product) => {
      const productSizes = product.metaData?.sizes;
      if (productSizes && Array.isArray(productSizes)) {
        productSizes.forEach((size: string) => sizes.add(size));
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
        productColors.forEach((color: string) => colors.add(color));
      }
    });
    return Array.from(colors).sort();
  }, [products]);

  // Get product counts per brand
  const productCounts = useMemo(() => {
    const brandCounts: Record<string, number> = {};
    if (!products) return { brands: brandCounts };

    products.forEach((product) => {
      if (product.brandId) {
        brandCounts[product.brandId] = (brandCounts[product.brandId] || 0) + 1;
      }
    });

    return { brands: brandCounts };
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    // Start with search filter
    let filtered = products.filter((product) =>
      fuzzySearch(searchValue, product.name || "")
    );

    // Apply brand filter
    if (appliedFilters.brands.length > 0) {
      filtered = filtered.filter((product) =>
        appliedFilters.brands.includes(product.brandId || "")
      );
    }

    // Apply size filter
    if (appliedFilters.sizes.length > 0) {
      filtered = filtered.filter((product) => {
        const productSizes = product.metaData?.sizes;
        if (!productSizes || !Array.isArray(productSizes)) return false;
        return appliedFilters.sizes.some((size) => productSizes.includes(size));
      });
    }

    // Apply color filter
    if (appliedFilters.colors.length > 0) {
      filtered = filtered.filter((product) => {
        const productColors = product.metaData?.colors;
        if (!productColors || !Array.isArray(productColors)) return false;
        return appliedFilters.colors.some((color) =>
          productColors.some((productColor: string) =>
            productColor.toLowerCase().includes(color.toLowerCase())
          )
        );
      });
    }

    // Apply price filter
    if (appliedFilters.minPrice !== "" || appliedFilters.maxPrice !== "") {
      filtered = filtered.filter((product) => {
        const price = getProductPrice(product);
        const min =
          appliedFilters.minPrice === "" ? 0 : Number(appliedFilters.minPrice);
        const max =
          appliedFilters.maxPrice === ""
            ? Infinity
            : Number(appliedFilters.maxPrice);
        return price >= min && price <= max;
      });
    }

    // Apply delivery type filter (if needed in the future)
    // For now, all products are considered to have both free and express delivery

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
  }, [products, searchValue, appliedFilters, sortBy]);

  // Create filter options object
  const filterOptions = useMemo(
    () => ({
      brands: [], // This should be passed from outside since we need brand data
      availableSizes,
      availableColors,
      productCounts,
    }),
    [availableSizes, availableColors, productCounts]
  );

  return {
    appliedFilters,
    setAppliedFilters,
    clearAllFilters,
    filteredProducts,
    filterOptions,
  };
};
