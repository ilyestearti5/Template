import { allIcons } from "@biqpod/app/ui/apis";
import {
  Translate,
  Icon,
  AsyncComponent,
  EmptyComponent,
} from "@biqpod/app/ui/components";
import { useAsyncMemo } from "@biqpod/app/ui/hooks";
import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { api } from "../api";
import { Button } from "./Custom";
import { ProductCard } from "./ProductCard";
import { createScrollFunction, COMMON_STYLES } from "./utils";

interface CollectionProductsProps {
  collection: SnapBuy.Collection;
}
export const CollectionProducts = ({ collection }: CollectionProductsProps) => {
  const collections = useAsyncMemo(async () => {
    if (!collection.id) return null;
    return api.getCollection(collection.id);
  }, [collection.id]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const checkScrollability = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);
  // Memoized scroll functions
  const scrollLeft = useMemo(
    () => createScrollFunction(scrollContainerRef, -320, checkScrollability),
    [checkScrollability]
  );
  const scrollRight = useMemo(
    () => createScrollFunction(scrollContainerRef, 320, checkScrollability),
    [checkScrollability]
  );
  useEffect(() => {
    checkScrollability();
  }, [collections, checkScrollability]);
  if (!collection.products) {
    return null;
  }
  return (
    <div key={collection.id} className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-full w-12 h-12 overflow-hidden">
            <img
              src={collection.photo}
              alt={collection.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h2
            className="font-bold text-gray-900 text-3xl"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            {collection.name}
          </h2>
        </div>
        <Button
          className="px-6 py-2 border-2 hover:border-blue-400 rounded-full font-medium text-white transition-all duration-200"
          style={COMMON_STYLES.brandButton}
        >
          <Translate content="View All" />
        </Button>
      </div>
      <div className="relative">
        {/* Left Navigation Button */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="top-1/2 left-2 z-10 absolute flex justify-center items-center bg-white/80 hover:bg-white shadow-lg rounded-full w-10 h-10 transition-all -translate-y-1/2 duration-200 transform"
            style={{ backdropFilter: "blur(4px)" }}
          >
            <Icon
              icon={allIcons.solid.faChevronLeft}
              iconClassName="text-gray-600"
            />
          </button>
        )}
        {/* Right Navigation Button */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="top-1/2 right-2 z-10 absolute flex justify-center items-center bg-white/80 hover:bg-white shadow-lg rounded-full w-10 h-10 transition-all -translate-y-1/2 duration-200 transform"
            style={{ backdropFilter: "blur(4px)" }}
          >
            <Icon
              icon={allIcons.solid.faChevronRight}
              iconClassName="text-gray-600"
            />
          </button>
        )}
        <div
          ref={scrollContainerRef}
          className="relative flex items-center gap-4 pb-4 w-full overflow-x-auto scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
          onScroll={checkScrollability}
        >
          {collections?.products?.map((prodId) => (
            <div key={prodId} className="flex-shrink-0">
              <AsyncComponent
                render={async () => {
                  const product = await api.getProduct(prodId);
                  if (!product) {
                    return <EmptyComponent />;
                  }
                  return <ProductCard product={product} />;
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
