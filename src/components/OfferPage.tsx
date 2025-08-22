import { allIcons } from "@biqpod/app/ui/apis";
import { Translate, Icon } from "@biqpod/app/ui/components";
import { useAsyncMemo } from "@biqpod/app/ui/hooks";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useParams, useHistory } from "react-router";
import { api } from "../api";
import { Button } from "./Custom";
import { ProductCard } from "./ProductCard";
import { BRAND_COLOR, icons } from "./utils";
import { Breadcrumb } from "./Breadcrumb";

export const OfferPage = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const history = useHistory();
  const [selectedOffer, setSelectedOffer] = useState<SnapBuy.Pack | null>(null);
  // Fetch offers/packs for this store
  const offers = useAsyncMemo(async () => {
    return api.getPacks();
  }, []);
  // Fetch products for this store
  const products = useAsyncMemo(async () => {
    return api.getProducts();
  }, []);
  // Set selected offer when offers are loaded
  useEffect(() => {
    if (offers && offerId) {
      const offer = offers.find((o) => o.id === offerId);
      setSelectedOffer(offer || null);
    }
  }, [offers, offerId]);
  // Filtered products for selected offer
  const offerProducts = useMemo(() => {
    if (!products || !selectedOffer || !selectedOffer.products) return [];
    return products.filter(
      (product) =>
        selectedOffer.products?.some((p) => p.prodId === product.id) || false
    );
  }, [products, selectedOffer]);
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          {
            label: selectedOffer?.name || "Offer",
            isTranslatable: selectedOffer?.name ? false : true,
          },
        ]}
      />
      {/* Offer Header */}
      <div className="mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-6 mb-8">
          <div>
            <h1 className="mb-2 font-bold text-gray-900 text-4xl">
              {selectedOffer?.name}
            </h1>
            <div className="flex items-center gap-4 mb-2">
              <span
                className="font-bold text-3xl"
                style={{ color: BRAND_COLOR }}
              >
                {selectedOffer?.price} DA
              </span>
              <span
                style={{
                  color: BRAND_COLOR,
                }}
              >
                <Icon icon={icons.tag} iconClassName="text-2xl" />
              </span>
            </div>
            <p className="text-gray-600 text-lg">
              <Translate content="special offer including" />{" "}
              {offerProducts.length} <Translate content="amazing products" />
            </p>
          </div>
        </div>
        {/* Products Grid */}
        {offerProducts.length === 0 ? (
          /* No Products Found */
          <div className="flex flex-col items-center gap-6 bg-gray-50 p-12 rounded-lg text-center">
            <div className="bg-white shadow-lg p-8 rounded-full">
              <Icon icon={icons.tag} iconClassName="text-6xl text-gray-400" />
            </div>
            <div>
              <h3 className="mb-2 font-bold text-gray-900 text-2xl">
                <Translate content="No Products Found" />
              </h3>
              <p className="text-gray-600 text-lg">
                <Translate content="This offer has no products yet" />
              </p>
            </div>
            <Button
              onClick={() => {
                history.push("/");
              }}
              className="px-8 py-3 rounded font-semibold text-white capitalize"
              style={{ backgroundColor: "#89CFF0" }}
            >
              <Icon icon={allIcons.solid.faArrowLeft} iconClassName="mr-2" />
              <Translate content="back to home" />
            </Button>
          </div>
        ) : (
          /* Products Grid */
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {offerProducts.map((product, index) => {
              // Find the product details from the offer
              const offerProduct = selectedOffer?.products?.find(
                (p) => p.prodId === product.id
              );
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="relative w-fit">
                    <ProductCard product={product} />
                    {/* Offer Badge */}
                    <div className="top-10 left-2 absolute bg-red-500 px-2 py-1 rounded-full font-bold text-white text-xs">
                      Pack: {offerProduct?.count}x
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        {/* Offer Summary */}
        {offerProducts.length > 0 && (
          <div className="bg-gray-50 mt-12 p-6 border border-sky-300 border-solid rounded-lg">
            <h3 className="mb-4 font-bold text-gray-900 text-xl capitalize">
              <Translate content="offer Summary" />
            </h3>
            <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
              <div className="text-center">
                <div
                  className="font-bold text-2xl"
                  style={{ color: "#89CFF0" }}
                >
                  {offerProducts.length}
                </div>
                <div className="text-gray-600 text-sm capitalize">
                  <Translate content="products included" />
                </div>
              </div>
              <div className="text-center">
                <div
                  className="font-bold text-2xl"
                  style={{ color: "#89CFF0" }}
                >
                  {selectedOffer?.products?.reduce(
                    (sum, p) => sum + (p.count || 1),
                    0
                  ) || 0}
                </div>
                <div className="text-gray-600 text-sm capitalize">
                  <Translate content="total items" />
                </div>
              </div>
              <div className="text-center">
                <div
                  className="font-bold text-2xl"
                  style={{ color: "#89CFF0" }}
                >
                  {selectedOffer?.price} DA
                </div>
                <div className="text-gray-600 text-sm capitalize">
                  <Translate content="special price" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
