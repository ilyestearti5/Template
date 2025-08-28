import { allIcons } from "@biqpod/app/ui/apis";
import { EmptyComponent, Icon, Translate } from "@biqpod/app/ui/components";
import { useAsyncMemo } from "@biqpod/app/ui/hooks";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useParams } from "react-router";
import { api } from "../api";
import { Breadcrumb } from "./Breadcrumb";
import { ProductCard } from "./ProductCard";
import { COMMON_STYLES, MONTSERRAT_FONT } from "./utils";
export const BrandPage = () => {
  const { brandId } = useParams<{ brandId: string }>();
  const brand = useAsyncMemo(async () => {
    if (!brandId) return null;
    return await api.getBrand(brandId);
  }, [brandId]);
  const products = useAsyncMemo(async () => {
    const all = await api.getProducts();
    return all?.filter((p) => p.brandId === brandId) || [];
  }, [brandId]);
  const productCount = products?.length || 0;
  const headerPhoto = useMemo(() => {
    return brand?.photo || undefined;
  }, [brand]);
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <Breadcrumb
        className="top-0 left-0 z-10 sticky w-full"
        items={[
          { label: "Brand", isTranslatable: true },
          { label: brand?.name || "..." },
        ]}
      />
      {/* Header */}
      <div className="relative">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200 border-b">
          <div className="mx-auto px-4 py-8 max-w-7xl">
            {headerPhoto ? (
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={headerPhoto}
                  alt={brand?.name || "Brand"}
                  className="w-full max-h-96 object-contain"
                />
              </div>
            ) : (
              <div className="flex justify-center items-center bg-white shadow-sm border border-gray-200 rounded-lg w-full h-48">
                <Icon
                  icon={allIcons.solid.faTag}
                  iconClassName="text-3xl text-gray-400"
                />
              </div>
            )}
            <div className="mt-6">
              <h1
                className="mb-2 font-bold text-gray-900 text-3xl"
                style={{ fontFamily: MONTSERRAT_FONT }}
              >
                {brand?.name || <Translate content="Loading" />}
              </h1>
              {brand?.description && (
                <p
                  className="max-w-3xl text-gray-600"
                  style={COMMON_STYLES.interFont}
                >
                  {brand.description}
                </p>
              )}
              <div
                className="flex gap-3 mt-4 text-gray-600 text-sm"
                style={COMMON_STYLES.interFont}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    icon={allIcons.solid.faBoxOpen}
                    iconClassName="text-xs"
                  />
                  <span>
                    {productCount} <Translate content="Products" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Products Grid */}
      <div className="mx-auto px-4 py-8 max-w-7xl">
        {productCount === 0 ? (
          <div className="flex flex-col items-center gap-6 bg-gray-50 p-12 rounded-lg text-center">
            <div className="bg-white shadow-lg p-8 rounded-full">
              <Icon
                icon={allIcons.solid.faBoxOpen}
                iconClassName="text-6xl text-gray-400"
              />
            </div>
            <div>
              <h3 className="mb-2 font-bold text-gray-900 text-2xl">
                <Translate content="No Products Found" />
              </h3>
              <p className="text-gray-600 text-lg">
                <Translate content="This brand has no products yet" />
              </p>
            </div>
          </div>
        ) : (
          <div className="flex max-md:flex-col flex-wrap max-md:items-center md:items-stretch gap-2">
            <EmptyComponent>
              {products!.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </EmptyComponent>
          </div>
        )}
      </div>
    </div>
  );
};
