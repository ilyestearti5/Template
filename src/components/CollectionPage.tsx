import { allIcons } from "@biqpod/app/ui/apis";
import { Icon, Translate } from "@biqpod/app/ui/components";
import { useAsyncMemo } from "@biqpod/app/ui/hooks";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useParams, useHistory } from "react-router";
import { api } from "../api";
import { Button } from "./Custom";
import { ProductCard } from "./ProductCard";
import { Breadcrumb } from "./Breadcrumb";

export const CollectionPage = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const history = useHistory();
  const [selectedCollection, setSelectedCollection] =
    useState<SnapBuy.Collection | null>(null);
  // Fetch collections for this store
  const collections = useAsyncMemo(async () => {
    return api.getCollections();
  }, []);
  // Fetch products for this store
  const products = useAsyncMemo(async () => {
    return api.getProducts();
  }, []);
  // Set selected collection when collections are loaded
  useEffect(() => {
    if (collections && collectionId) {
      const collection = collections.find((c) => c.id === collectionId);
      setSelectedCollection(collection || null);
    }
  }, [collections, collectionId]);
  // Filtered products for selected collection
  const collectionProducts = useMemo(() => {
    if (!products || !selectedCollection || !selectedCollection.products)
      return [];
    return products.filter(
      (product) => selectedCollection.products?.includes(product.id!) || false
    );
  }, [products, selectedCollection]);
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          {
            label: selectedCollection?.name || "Collection",
            isTranslatable: selectedCollection?.name ? false : true,
          },
        ]}
      />
      {/* Collection Header */}
      <div className="mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-6 mb-8">
          <div>
            <div className="rounded-full w-24 h-24 overflow-hidden">
              <img
                src={selectedCollection?.photo}
                alt={selectedCollection?.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <h1 className="mb-2 font-bold text-gray-900 text-4xl">
              {selectedCollection?.name}
            </h1>
            <p className="text-gray-600 text-lg">
              <Translate content="Discover" /> {collectionProducts.length}{" "}
              <Translate content="amazing products in this collection" />
            </p>
          </div>
        </div>
        {/* Products Grid */}
        {collectionProducts.length === 0 ? (
          /* No Products Found */
          <div className="flex flex-col items-center gap-6 bg-gray-50 p-12 rounded-lg text-center">
            <div className="bg-white shadow-lg p-8 rounded-full">
              <Icon
                icon={allIcons.solid.faShoppingBag}
                iconClassName="text-6xl text-gray-400"
              />
            </div>
            <div>
              <h3 className="mb-2 font-bold text-gray-900 text-2xl">
                <Translate content="No Products Found" />
              </h3>
              <p className="text-gray-600 text-lg">
                <Translate content="This collection has no products yet" />
              </p>
            </div>
            <Button
              onClick={() => {
                history.push("/");
              }}
              className="px-8 py-3 rounded font-semibold text-white"
              style={{ backgroundColor: "#89CFF0" }}
            >
              <Icon icon={allIcons.solid.faArrowLeft} iconClassName="mr-2" />
              <Translate content="Back to Home" />
            </Button>
          </div>
        ) : (
          /* Products Grid */
          <div className="flex max-md:flex-col flex-wrap md:justify-center max-md:items-center md:items-stretch gap-2">
            {collectionProducts.map((product, index) => (
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
      </div>
    </div>
  );
};
