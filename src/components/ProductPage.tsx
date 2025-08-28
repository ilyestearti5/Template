import { allIcons } from "@biqpod/app/ui/apis";
import { EmptyComponent, Icon, Translate } from "@biqpod/app/ui/components";
import { tw } from "@biqpod/app/ui/utils";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useHistory } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  addToCart,
  useIsFavorite,
  toggleFavorite,
  useIsSignedIn,
  FullCartItem,
} from "../hooks";
import { Button } from "./Custom";
import {
  getProductPriceDisplay,
  getProductPricesForCustomer,
  icons,
  COMMON_STYLES,
  MONTSERRAT_FONT,
  BRAND_COLOR,
  BRAND_COLOR_PRIMARY,
  BRAND_COLOR_SECONDARY,
  BRAND_COLOR_LIGHT,
  PLAYFAIR_FONT,
  ROBOTO_FONT,
  INTER_FONT,
} from "./utils";
import { useAsyncMemo } from "@biqpod/app/ui/hooks";
import { api, initPixels } from "../api";
import { Breadcrumb } from "./Breadcrumb";
import { ProductCard } from "./ProductCard";
import { CheckoutInformation } from "./CheckoutInformation";
// Enhanced Markdown Renderer Component
const MarkdownRenderer = ({ content }: { content: string }) => {
  // Fallback for rendering errors
  const [renderError, setRenderError] = useState(false);
  const handleRenderError = () => {
    setRenderError(true);
  };
  if (renderError) {
    return (
      <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-lg">
        <div className="flex items-center mb-2">
          <Icon
            icon={allIcons.solid.faExclamationTriangle}
            iconClassName="text-yellow-600 mr-2"
          />
          <span className="font-medium text-yellow-800">
            <Translate content="Markdown Rendering Error" />
          </span>
        </div>
        <p className="mb-3 text-yellow-700 text-sm">
          <Translate content="The description contains formatting that couldn't be rendered. Showing plain text instead:" />
        </p>
        <div
          className="bg-white p-3 border rounded text-gray-700 whitespace-pre-wrap"
          style={{ fontFamily: INTER_FONT }}
        >
          {content}
        </div>
      </div>
    );
  }
  try {
    return (
      <div className="max-w-none prose prose-lg prose-gray">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom styling for markdown elements
            h1: ({ children }) => (
              <h1
                className="mb-6 font-bold text-gray-900 text-3xl"
                style={{ fontFamily: PLAYFAIR_FONT }}
              >
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2
                className="mt-8 mb-4 font-bold text-gray-800 text-2xl"
                style={{ fontFamily: PLAYFAIR_FONT }}
              >
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3
                className="mt-6 mb-3 font-semibold text-gray-800 text-xl"
                style={{ fontFamily: INTER_FONT }}
              >
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4
                className="mt-4 mb-2 font-semibold text-gray-700 text-lg"
                style={{ fontFamily: INTER_FONT }}
              >
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p
                className="mb-4 text-gray-700 text-base leading-relaxed"
                style={{ fontFamily: INTER_FONT }}
              >
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="space-y-2 mb-4 ml-6 list-disc list-outside">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="space-y-2 mb-4 ml-6 list-decimal list-outside">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li
                className="text-gray-700 text-base leading-relaxed"
                style={{ fontFamily: INTER_FONT }}
              >
                {children}
              </li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="bg-blue-50 my-4 py-2 pl-4 border-blue-300 border-l-4 text-blue-800 italic">
                {children}
              </blockquote>
            ),
            code: ({ children }) => (
              <code className="bg-gray-100 px-2 py-1 rounded font-mono text-gray-800 text-sm">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-gray-100 mb-4 p-4 rounded-lg overflow-x-auto">
                {children}
              </pre>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-gray-900">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="text-gray-800 italic">{children}</em>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-blue-600 hover:text-blue-800 underline transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="mb-4 overflow-x-auto">
                <table className="border border-gray-300 w-full border-collapse">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-50">{children}</thead>
            ),
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => (
              <tr className="border-gray-300 border-b">{children}</tr>
            ),
            th: ({ children }) => (
              <th
                className="bg-gray-100 px-4 py-2 border border-gray-300 font-semibold text-gray-900 text-left"
                style={{ fontFamily: INTER_FONT }}
              >
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td
                className="px-4 py-2 border border-gray-300 text-gray-700"
                style={{ fontFamily: INTER_FONT }}
              >
                {children}
              </td>
            ),
            hr: () => <hr className="my-8 border-gray-300" />,
            img: ({ src, alt }) => (
              <motion.img
                src={src}
                alt={alt}
                className="shadow-md my-4 rounded-lg max-w-full h-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                onError={handleRenderError}
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  } catch (error) {
    // If ReactMarkdown fails to render, show fallback
    return (
      <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-lg">
        <div className="flex items-center mb-2">
          <Icon
            icon={allIcons.solid.faExclamationTriangle}
            iconClassName="text-yellow-600 mr-2"
          />
          <span className="font-medium text-yellow-800">
            <Translate content="Markdown Rendering Error" />
          </span>
        </div>
        <p className="mb-3 text-yellow-700 text-sm">
          <Translate content="The description contains formatting that couldn't be rendered. Showing plain text instead:" />
        </p>
        <div
          className="bg-white p-3 border rounded text-gray-700 whitespace-pre-wrap"
          style={{ fontFamily: INTER_FONT }}
        >
          {content}
        </div>
      </div>
    );
  }
};
// Product Suggestions Component
const ProductSuggestions = ({
  currentProductId,
  currentBrandId,
}: {
  currentProductId?: string;
  currentBrandId?: string;
}) => {
  // Fetch suggested products
  const hist = useHistory();
  const suggestedProducts = useAsyncMemo(async () => {
    const allProducts = await api.getProducts(16); // Get more products for better filtering
    if (!allProducts) return [];
    // Filter out current product
    let filteredProducts = allProducts.filter(
      (product) => product.id !== currentProductId
    );
    // Categorize products by relevance
    const sameBrandProducts = filteredProducts.filter(
      (p) => p.brandId === currentBrandId
    );
    const otherProducts = filteredProducts.filter(
      (p) => p.brandId !== currentBrandId
    );
    // Mix same brand products with others (prioritize same brand)
    const suggestions = [
      ...sameBrandProducts.slice(0, 4), // Up to 4 from same brand
      ...otherProducts.slice(0, 4), // Up to 4 from other brands
    ].slice(0, 8); // Maximum 8 suggestions
    return suggestions;
  }, [currentProductId, currentBrandId]);
  if (!suggestedProducts || suggestedProducts.length === 0) {
    return (
      <motion.div
        className="bg-gradient-to-br from-gray-50 to-white border-gray-200 border-t"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <div className="mx-auto px-8 py-12 max-w-7xl">
          <motion.div className="text-center" variants={staggerItem}>
            <Icon
              icon={allIcons.solid.faSpinner}
              iconClassName="text-gray-400 text-4xl mb-4 animate-spin"
            />
            <p
              className="text-gray-500 text-lg"
              style={{ fontFamily: INTER_FONT }}
            >
              <Translate content="Loading suggestions..." />
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      className="bg-gradient-to-br from-gray-50 to-white border-gray-200 border-t"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.0 }}
    >
      <div className="mx-auto px-8 py-12 max-w-7xl">
        <motion.div className="mb-8 text-center" variants={staggerItem}>
          <motion.div
            className="inline-flex items-center mb-4 px-4 py-2 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${BRAND_COLOR_LIGHT}20, ${BRAND_COLOR_SECONDARY}20)`,
            }}
            whileHover={{ scale: 1.05 }}
          >
            <Icon
              icon={allIcons.solid.faLightbulb}
              iconClassName="mr-2 text-blue-600"
            />
            <span
              className="font-medium text-sm"
              style={{
                fontFamily: INTER_FONT,
                color: BRAND_COLOR_PRIMARY,
              }}
            >
              <Translate content="Personalized Recommendations" />
            </span>
          </motion.div>
          <h3
            className="mb-4 font-bold text-gray-900 text-3xl"
            style={{ fontFamily: PLAYFAIR_FONT }}
          >
            <Translate content="You Might Also Like" />
          </h3>
          <p
            className="mx-auto max-w-2xl text-gray-600 text-lg"
            style={{ fontFamily: INTER_FONT }}
          >
            <Translate content="Discover more amazing products handpicked just for you" />
          </p>
        </motion.div>
        <motion.div
          className="flex flex-wrap justify-evenly gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {suggestedProducts.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
        </motion.div>
        {/* Action Buttons */}
        <motion.div
          className="flex sm:flex-row flex-col justify-center items-center gap-4 mt-10"
          variants={staggerItem}
        >
          <motion.button
            onClick={() => window.history.back()}
            className="shadow-lg hover:shadow-xl px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${BRAND_COLOR_PRIMARY}, ${BRAND_COLOR_SECONDARY})`,
              fontFamily: INTER_FONT,
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon icon={allIcons.solid.faArrowLeft} iconClassName="mr-3" />
            <Translate content="Back to Shopping" />
          </motion.button>
          <motion.button
            onClick={() => {
              hist.push("/");
              // Navigate to all products page or home
            }}
            className="shadow-lg hover:shadow-xl px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${BRAND_COLOR_LIGHT}, ${BRAND_COLOR_SECONDARY})`,
              fontFamily: INTER_FONT,
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon icon={allIcons.solid.faStore} iconClassName="mr-3" />
            <Translate content="View All Products" />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};
// Animation variants
const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 60 },
};
const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
export const ProductPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const history = useHistory();
  // State management
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageError, setImageError] = useState<{ [key: number]: boolean }>({});
  const [favoriteClicked, setFavoriteClicked] = useState(false);
  const [cartClicked, setCartClicked] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<{
    quantity: number;
    price: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<
    "description" | "specs" | "reviews" | "contact" | "shipping" | "warranty"
  >("description");
  const [, setImageLoaded] = useState(false);
  const [showBuyNowCheckout, setShowBuyNowCheckout] = useState(false);
  // Fetch product data
  const product = useAsyncMemo(async () => {
    if (productId) {
      return await api.getProduct(productId);
    }
    return null;
  }, [productId]);
  // Fetch brand and store
  const brand = useAsyncMemo(async () => {
    if (product?.brandId) {
      return await api.getBrand(product.brandId);
    }
    return null;
  }, [product?.brandId]);
  const store = useAsyncMemo(async () => {
    return await api.getStore();
  }, []);
  // Hooks
  const isSignedIn = useIsSignedIn();
  const isFavorite = useIsFavorite(product?.id || "");
  // Memoized values
  const photos = useMemo(() => product?.photos || [], [product?.photos]);
  const hasMultiplePhotos = useMemo(() => photos.length > 1, [photos.length]);
  // Get current cart count for this product
  // Get pricing based on authentication state
  const priceDisplay = useMemo(() => {
    if (isSignedIn && product) {
      return getProductPricesForCustomer(product);
    } else if (product) {
      return { single: getProductPriceDisplay(product) };
    } else {
      return { single: "0 DA" };
    }
  }, [product, isSignedIn]);
  // Handle variant selection for multiple type products
  const availableVariants = useMemo(() => {
    if (product?.type === "multiple" && product?.multiple?.prices) {
      return product.multiple.prices.sort((a, b) => a.quantity - b.quantity);
    }
    return [];
  }, [product]);
  // Set default variant
  useEffect(() => {
    if (availableVariants.length > 0 && !selectedVariant) {
      setSelectedVariant(availableVariants[0]);
    }
  }, [availableVariants, selectedVariant]);
  // Get current price based on selected variant or single price
  // const getCurrentPrice = () => {
  //   if (product.type === "multiple" && selectedVariant) {
  //     return selectedVariant.price;
  //   }
  //   if (product.type === "single") {
  //     return isSignedIn ? (product.single?.customer || 0) : (product.single?.client || 0);
  //   }
  //   return 0;
  // };
  // Handle image error
  const handleImageError = (index: number) => {
    setImageError((prev) => ({ ...prev, [index]: true }));
  };
  // Handle add to cart
  const handleAddToCart = () => {
    if (product?.id) {
      setCartClicked(true);
      const quantityToSet =
        product.type === "multiple"
          ? selectedVariant?.quantity || 1
          : selectedQuantity;
      addToCart(product.id, quantityToSet);
      setTimeout(() => setCartClicked(false), 600);
    }
  };
  const pixels = initPixels(store);
  // Handle favorite toggle
  const handleToggleFavorite = () => {
    if (product?.id) {
      setFavoriteClicked(true);
      !isFavorite && pixels?.favorite(product);
      toggleFavorite(product.id);
      setTimeout(() => setFavoriteClicked(false), 600);
    }
  };
  // Handle Buy Now
  const handleBuyNow = () => {
    if (product?.id) {
      setShowBuyNowCheckout(true);
    }
  };
  // Get Buy Now total price
  const getBuyNowTotalPrice = () => {
    if (!product) return 0;
    const quantity =
      product.type === "multiple"
        ? selectedVariant?.quantity || 1
        : selectedQuantity;
    const unitPrice = isSignedIn
      ? product.type === "multiple"
        ? selectedVariant?.price || 0
        : product.single?.customer || 0
      : product.type === "multiple"
      ? selectedVariant?.price || 0
      : product.single?.client || 0;
    return unitPrice * quantity;
  };
  // Get Buy Now cart
  const getBuyNowCart = (): FullCartItem[] => {
    if (!product?.id) return [];
    const quantity =
      product.type === "multiple"
        ? selectedVariant?.quantity || 1
        : selectedQuantity;
    return [
      {
        prodId: product.id,
        count: quantity,
        type: "product",
      },
    ];
  };
  // Auto-slide photos
  useEffect(() => {
    if (!hasMultiplePhotos) return;
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevIndex) =>
        prevIndex === photos.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [photos.length, hasMultiplePhotos]);
  const brandLabel = brand?.name || store?.name || "";
  // Loading state
  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          className="border-4 border-gray-200 border-t-4 rounded-full w-8 h-8"
          style={{ borderTopColor: BRAND_COLOR }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }
  // Product not found
  if (!product.id) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center">
        <Icon icon={icons.search} iconClassName="text-6xl text-gray-400 mb-4" />
        <h1 className="mb-2 font-bold text-gray-700 text-2xl">
          <Translate content="Product Not Found" />
        </h1>
        <p className="mb-6 text-gray-500">
          <Translate content="The product you're looking for doesn't exist or has been removed." />
        </p>
        <Button
          className="px-6 py-3 rounded-lg font-medium text-white transition-all duration-200"
          style={COMMON_STYLES.brandButton}
          onClick={() => history.push("/")}
        >
          <Translate content="Go Home" />
        </Button>
      </div>
    );
  }
  return (
    <motion.div
      className="bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Modern Breadcrumb with gradient and back button */}
      <motion.div
        className="relative bg-white shadow-sm overflow-hidden"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-transparent to-purple-50" />
        <div className="relative max-w-7xl">
          <Breadcrumb
            items={[
              {
                label: "Home",
                onClick: () => history.push("/"),
                isTranslatable: true,
              },
              ...(brand
                ? [
                    {
                      label: brand.name || "Brand",
                      onClick: () => history.push(`/brand/${brand.id}`),
                    },
                  ]
                : []),
              { label: product.name || "Product" },
            ]}
          />
        </div>
      </motion.div>
      <div className="mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          className="bg-white shadow-2xl rounded-3xl overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="xl:flex">
            {/* Enhanced Product Images Section */}
            <motion.div
              className="relative xl:w-1/2"
              variants={fadeInLeft}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100">
                {photos.length > 0 ? (
                  <div className="relative w-full h-96 xl:h-[700px] overflow-hidden">
                    {/* Main Image Display with enhanced animations */}
                    <motion.div
                      className="flex h-full"
                      animate={{
                        x: `-${currentPhotoIndex * (100 / photos.length)}%`,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      style={{ width: `${photos.length * 100}%` }}
                    >
                      {photos.map((photo, index) => (
                        <motion.div
                          key={index}
                          className="group relative flex-shrink-0 w-full h-full"
                          style={{ width: `${100 / photos.length}%` }}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.3 }}
                        >
                          {imageError[index] ? (
                            <div className="flex justify-center items-center bg-gradient-to-br from-gray-200 to-gray-300 w-full h-full">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                <Icon
                                  icon={icons.image}
                                  iconClassName="text-6xl text-gray-400"
                                />
                              </motion.div>
                            </div>
                          ) : (
                            <motion.img
                              src={photo}
                              alt={`${product.name} - ${index + 1}`}
                              className="w-full h-full object-contain group-hover:scale-105 transition-all duration-500"
                              onError={() => handleImageError(index)}
                              onLoad={() => setImageLoaded(true)}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                            />
                          )}
                          {/* Image overlay effect */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>
                      ))}
                    </motion.div>
                    {/* Enhanced Photo Navigation */}
                    {hasMultiplePhotos && (
                      <>
                        <motion.button
                          onClick={() =>
                            setCurrentPhotoIndex((prev) =>
                              prev === 0 ? photos.length - 1 : prev - 1
                            )
                          }
                          className="group top-1/2 left-6 absolute bg-gradient-to-r from-slate-900/80 hover:from-slate-900 to-slate-800/80 hover:to-slate-800 shadow-2xl backdrop-blur-md p-4 border border-white/20 rounded-2xl text-white transition-all -translate-y-1/2 duration-300 transform"
                          whileHover={{ scale: 1.15, x: -8 }}
                          whileTap={{ scale: 0.9 }}
                          style={{ backdropFilter: "blur(12px)" }}
                        >
                          <Icon
                            icon={allIcons.solid.faChevronLeft}
                            iconClassName="text-xl group-hover:scale-110 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                        </motion.button>
                        <motion.button
                          onClick={() =>
                            setCurrentPhotoIndex((prev) =>
                              prev === photos.length - 1 ? 0 : prev + 1
                            )
                          }
                          className="group top-1/2 right-6 absolute bg-gradient-to-r from-slate-900/80 hover:from-slate-900 to-slate-800/80 hover:to-slate-800 shadow-2xl backdrop-blur-md p-4 border border-white/20 rounded-2xl text-white transition-all -translate-y-1/2 duration-300 transform"
                          whileHover={{ scale: 1.15, x: 8 }}
                          whileTap={{ scale: 0.9 }}
                          style={{ backdropFilter: "blur(12px)" }}
                        >
                          <Icon
                            icon={allIcons.solid.faChevronRight}
                            iconClassName="text-xl group-hover:scale-110 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                        </motion.button>
                        {/* Enhanced Photo Counter */}
                        <motion.div
                          className="top-6 right-6 absolute bg-black/80 shadow-2xl backdrop-blur-md px-5 py-3 border border-white/20 rounded-2xl font-bold text-white text-sm"
                          style={{
                            fontFamily: MONTSERRAT_FONT,
                            backdropFilter: "blur(12px)",
                          }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          {currentPhotoIndex + 1} / {photos.length}
                        </motion.div>
                      </>
                    )}
                    {/* Enhanced Thumbnail Navigation */}
                    {hasMultiplePhotos && photos.length <= 6 && (
                      <motion.div
                        className="bottom-6 left-1/2 absolute flex space-x-3 -translate-x-1/2 transform"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        {photos.map((photo, index) => (
                          <motion.button
                            key={index}
                            onClick={() => setCurrentPhotoIndex(index)}
                            className={tw(
                              "w-16 h-16 rounded-lg overflow-hidden border-3 transition-all duration-300 relative",
                              currentPhotoIndex === index
                                ? "border-blue-500 shadow-lg scale-110"
                                : "border-white/50 hover:border-white hover:scale-105"
                            )}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <img
                              src={photo}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {currentPhotoIndex === index && (
                              <motion.div
                                className="absolute inset-0 bg-blue-500/20"
                                layoutId="activeThumbnail"
                              />
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <motion.div
                    className="flex justify-center items-center bg-gradient-to-br from-gray-200 to-gray-300 w-full h-96 xl:h-[700px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.6, type: "spring" }}
                    >
                      <Icon
                        icon={icons.image}
                        iconClassName="text-6xl text-gray-400"
                      />
                    </motion.div>
                  </motion.div>
                )}
                {/* Enhanced Badges */}
                <AnimatePresence>
                  {product.limited && (
                    <motion.div
                      className="top-6 left-6 absolute bg-gradient-to-r from-red-500 to-pink-500 shadow-lg px-4 py-2 rounded-full font-bold text-white text-sm"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{
                        delay: 0.3,
                        type: "spring",
                        stiffness: 200,
                      }}
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      <Icon
                        icon={allIcons.solid.faCrown}
                        iconClassName="mr-2"
                      />
                      <Translate content="Limited Edition" />
                    </motion.div>
                  )}
                  {isSignedIn &&
                    "hasDiscount" in priceDisplay &&
                    priceDisplay.hasDiscount &&
                    priceDisplay.discountPercentage >= 10 && (
                      <motion.div
                        className={tw(
                          "absolute bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 rounded-full font-bold text-white text-sm shadow-lg",
                          product.limited ? "top-20 left-6" : "top-6 left-6"
                        )}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{
                          delay: 0.5,
                          type: "spring",
                          stiffness: 200,
                        }}
                        whileHover={{ scale: 1.05, rotate: -5 }}
                      >
                        <Icon
                          icon={allIcons.solid.faTag}
                          iconClassName="text-white mr-2"
                        />
                        {priceDisplay.discountPercentage}% OFF
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>
            </motion.div>
            {/* Enhanced Product Information Section */}
            <motion.div
              className="p-8 xl:p-12 xl:w-1/2"
              variants={fadeInRight}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-6"
              >
                {/* Brand with enhanced styling */}
                {brandLabel && (
                  <motion.div variants={staggerItem} className="mb-4">
                    <motion.span
                      className="inline-block px-4 py-2 rounded-full font-semibold text-sm uppercase tracking-wider"
                      style={{
                        background: `linear-gradient(135deg, ${BRAND_COLOR_LIGHT}30, ${BRAND_COLOR_SECONDARY}30)`,
                        color: BRAND_COLOR_PRIMARY,
                        fontFamily: ROBOTO_FONT,
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {brandLabel}
                    </motion.span>
                  </motion.div>
                )}
                {/* Enhanced Product Name */}
                <motion.h1
                  variants={staggerItem}
                  className="font-bold text-gray-900 text-3xl xl:text-5xl leading-tight"
                  style={{ fontFamily: PLAYFAIR_FONT }}
                >
                  {product.name}
                </motion.h1>
                {/* Enhanced Pricing */}
                <motion.div variants={staggerItem} className="space-y-3">
                  {isSignedIn && "customerPriceDisplay" in priceDisplay ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <motion.span
                          className="bg-clip-text font-bold text-transparent text-4xl xl:text-5xl"
                          style={{
                            background: `linear-gradient(135deg, ${BRAND_COLOR_SECONDARY}, ${BRAND_COLOR_LIGHT})`,
                            WebkitBackgroundClip: "text",
                            fontFamily: MONTSERRAT_FONT,
                          }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.7, type: "spring" }}
                        >
                          {priceDisplay.customerPriceDisplay}
                        </motion.span>
                        {priceDisplay.hasDiscount && (
                          <motion.span
                            className="bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 rounded-full font-semibold text-white text-sm"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.8, type: "spring" }}
                          >
                            -{priceDisplay.discountPercentage}% OFF
                          </motion.span>
                        )}
                      </div>
                      {priceDisplay.hasDiscount && (
                        <motion.div
                          className="space-y-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.9 }}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="text-gray-500 text-xl line-through"
                              style={{ fontFamily: MONTSERRAT_FONT }}
                            >
                              {priceDisplay.clientPriceDisplay}
                            </span>
                            <span className="text-gray-400 text-sm">
                              <Translate content="Regular Price" />
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon
                              icon={allIcons.solid.faPiggyBank}
                              iconClassName="text-green-600 mr-1"
                            />
                            <span className="font-medium text-green-600 text-sm">
                              <Translate content="You save" />:{" "}
                              {priceDisplay.discountAmount} DA
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <motion.span
                      className="bg-clip-text font-bold text-transparent text-4xl xl:text-5xl"
                      style={{
                        background: `linear-gradient(135deg, ${BRAND_COLOR_SECONDARY}, ${BRAND_COLOR_LIGHT})`,
                        WebkitBackgroundClip: "text",
                        fontFamily: MONTSERRAT_FONT,
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: "spring" }}
                    >
                      {"single" in priceDisplay
                        ? priceDisplay.single
                        : getProductPriceDisplay(product)}
                    </motion.span>
                  )}
                </motion.div>
                {/* Enhanced Variants Section */}
                {product.type === "multiple" &&
                  availableVariants.length > 0 && (
                    <motion.div variants={staggerItem} className="space-y-4">
                      <h3
                        className="font-semibold text-gray-900 text-xl"
                        style={{ fontFamily: INTER_FONT }}
                      >
                        <Translate content="Choose Quantity" />
                      </h3>
                      <div className="gap-3 grid grid-cols-2 xl:grid-cols-3">
                        {availableVariants.map((variant, index) => (
                          <motion.button
                            key={index}
                            onClick={() => setSelectedVariant(variant)}
                            className={tw(
                              "p-4 border-2 rounded-xl text-center transition-all duration-300 relative overflow-hidden",
                              selectedVariant?.quantity === variant.quantity
                                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg scale-105"
                                : "border-gray-200 hover:border-blue-300 bg-white hover:shadow-md"
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 + index * 0.1 }}
                          >
                            <div className="font-semibold text-gray-900 text-lg">
                              {variant.quantity}x
                            </div>
                            <div className="font-bold text-blue-600 text-xl">
                              {variant.price} DA
                            </div>
                            {selectedVariant?.quantity === variant.quantity && (
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                                layoutId="selectedVariant"
                              />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                {/* Enhanced Quantity Selector */}
                {product.type === "single" && (
                  <motion.div variants={staggerItem} className="space-y-4">
                    <h3
                      className="font-semibold text-gray-900 text-xl"
                      style={{ fontFamily: INTER_FONT }}
                    >
                      <Translate content="Quantity" />
                    </h3>
                    <div className="flex items-center space-x-4">
                      <motion.button
                        onClick={() =>
                          setSelectedQuantity(Math.max(1, selectedQuantity - 1))
                        }
                        className="flex justify-center items-center bg-white hover:bg-gray-50 shadow-md hover:shadow-lg border-2 border-gray-300 hover:border-blue-400 rounded-xl w-12 h-12 transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Icon
                          icon={allIcons.solid.faMinus}
                          iconClassName="text-gray-600"
                        />
                      </motion.button>
                      <motion.span
                        className="flex justify-center items-center bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl w-16 h-12 font-bold text-gray-900 text-xl"
                        key={selectedQuantity}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {selectedQuantity}
                      </motion.span>
                      <motion.button
                        onClick={() =>
                          setSelectedQuantity(selectedQuantity + 1)
                        }
                        className="flex justify-center items-center bg-white hover:bg-gray-50 shadow-md hover:shadow-lg border-2 border-gray-300 hover:border-blue-400 rounded-xl w-12 h-12 transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Icon
                          icon={allIcons.solid.faPlus}
                          iconClassName="text-gray-600"
                        />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
                {/* Enhanced Action Buttons */}
                <motion.div
                  variants={staggerItem}
                  className="flex items-center gap-x-2 space-y-4 pt-6"
                >
                  {/* Buy Now Button with Add to Cart styling */}
                  <motion.button
                    className="relative shadow-lg hover:shadow-xl px-8 py-4 rounded-2xl w-full overflow-hidden font-bold text-white text-lg transition-all duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND_COLOR_SECONDARY}, ${BRAND_COLOR_LIGHT})`,
                      fontFamily: INTER_FONT,
                    }}
                    onClick={() => {
                      handleAddToCart();
                      handleBuyNow();
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    animate={
                      cartClicked
                        ? {
                            scale: [1, 1.05, 1],
                            transition: { duration: 0.3 },
                          }
                        : {}
                    }
                  >
                    <motion.div
                      className="z-10 relative flex justify-center items-center capitalize"
                      animate={
                        cartClicked
                          ? {
                              y: [0, -20, 0],
                              transition: { duration: 0.4 },
                            }
                          : {}
                      }
                    >
                      <Icon
                        icon={allIcons.solid.faCartShopping}
                        iconClassName="text-lg mr-3"
                      />
                      <span>
                        <Translate content="buy" />
                      </span>
                    </motion.div>
                    {/* Enhanced Success Effect */}
                    <AnimatePresence>
                      {cartClicked && (
                        <EmptyComponent>
                          <motion.div
                            className="absolute inset-0 bg-green-400 rounded-2xl"
                            initial={{ scale: 0, opacity: 0.7 }}
                            animate={{ scale: 4, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                          />
                          {[...Array(6)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="top-1/2 left-1/2 absolute bg-white rounded-full w-2 h-2"
                              initial={{ scale: 0, x: 0, y: 0 }}
                              animate={{
                                scale: [0, 1, 0],
                                x: Math.cos((i * 60 * Math.PI) / 180) * 40,
                                y: Math.sin((i * 60 * Math.PI) / 180) * 40,
                              }}
                              exit={{ scale: 0 }}
                              transition={{
                                duration: 0.6,
                                delay: i * 0.1,
                              }}
                            />
                          ))}
                        </EmptyComponent>
                      )}
                    </AnimatePresence>
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 -skew-x-12 transition-opacity translate-x-full hover:translate-x-[-100%] duration-500 transform" />
                  </motion.button>
                  <motion.button
                    onClick={handleToggleFavorite}
                    className={tw(
                      "flex justify-center items-center border-2 rounded-2xl w-32 h-16 transition-all duration-300 shadow-lg hover:shadow-xl",
                      isFavorite
                        ? "border-red-500 bg-gradient-to-br from-red-50 to-pink-50 text-red-500"
                        : "border-gray-300 bg-white text-gray-600 hover:border-red-300 hover:text-red-500"
                    )}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    animate={
                      favoriteClicked
                        ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, 15, -15, 0],
                            transition: { duration: 0.6 },
                          }
                        : {}
                    }
                  >
                    <motion.div
                      animate={
                        isFavorite
                          ? {
                              scale: [1, 1.3, 1],
                              transition: { duration: 0.3 },
                            }
                          : {}
                      }
                    >
                      <Icon
                        icon={
                          isFavorite
                            ? allIcons.solid.faHeart
                            : allIcons.regular.faHeart
                        }
                        iconClassName="text-2xl"
                      />
                    </motion.div>
                    {/* Heart particles effect */}
                    <AnimatePresence>
                      {favoriteClicked && isFavorite && (
                        <>
                          {[...Array(8)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="top-1/2 left-1/2 absolute bg-red-500 rounded-full w-1 h-1"
                              initial={{ scale: 0, x: 0, y: 0 }}
                              animate={{
                                scale: [0, 1, 0],
                                x: Math.cos((i * 45 * Math.PI) / 180) * 25,
                                y: Math.sin((i * 45 * Math.PI) / 180) * 25,
                              }}
                              exit={{ scale: 0 }}
                              transition={{ duration: 0.6, delay: i * 0.1 }}
                            />
                          ))}
                        </>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  {/* Enhanced Favorite Button */}
                </motion.div>
                {/* Enhanced Product Info */}
                <motion.div
                  variants={staggerItem}
                  className="space-y-3 pt-6 border-gray-200 border-t"
                >
                  {product.quantity !== undefined && (
                    <motion.div
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="flex items-center text-gray-600">
                        <Icon
                          icon={allIcons.solid.faBox}
                          iconClassName="mr-2"
                        />
                        <Translate content="Stock" />:
                      </span>
                      <span
                        className={tw(
                          "font-semibold px-3 py-1 rounded-full text-sm",
                          product.quantity > 10
                            ? "text-green-700 bg-green-100"
                            : product.quantity > 0
                            ? "text-yellow-700 bg-yellow-100"
                            : "text-red-700 bg-red-100"
                        )}
                      >
                        {product.quantity > 0 ? (
                          product.quantity > 10 ? (
                            <Translate content="In Stock" />
                          ) : (
                            `${product.quantity} left`
                          )
                        ) : (
                          <Translate content="Out of Stock" />
                        )}
                      </span>
                    </motion.div>
                  )}
                  {product.available !== undefined && (
                    <motion.div
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="flex items-center text-gray-600">
                        <Icon
                          icon={allIcons.solid.faCheckCircle}
                          iconClassName="mr-2"
                        />
                        <Translate content="Availability" />:
                      </span>
                      <span
                        className={tw(
                          "font-semibold px-3 py-1 rounded-full text-sm",
                          product.available
                            ? "text-green-700 bg-green-100"
                            : "text-red-700 bg-red-100"
                        )}
                      >
                        {product.available ? (
                          <Translate content="Available" />
                        ) : (
                          <Translate content="Unavailable" />
                        )}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
                {/* Social Media & Store Links */}
                <motion.div
                  className="bg-white shadow-lg p-6 border border-gray-100 rounded-2xl"
                  variants={fadeInLeft}
                >
                  <motion.h3
                    className="mb-6 font-bold text-gray-900 text-xl"
                    style={{ fontFamily: PLAYFAIR_FONT }}
                    variants={staggerItem}
                  >
                    <Translate content="Connect With Our Store" />
                  </motion.h3>
                  <motion.div
                    className="gap-4 grid grid-cols-2 md:grid-cols-4"
                    variants={staggerContainer}
                  >
                    <motion.a
                      href={store?.platforms?.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center bg-blue-50 hover:bg-blue-100 p-4 border border-blue-200 rounded-xl transition-all duration-300"
                      variants={staggerItem}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon
                        icon={allIcons.brands.faFacebookF}
                        iconClassName="text-blue-600 text-2xl mb-2 group-hover:scale-110 transition-transform"
                      />
                      <span
                        className="font-medium text-blue-700 text-sm"
                        style={{ fontFamily: INTER_FONT }}
                      >
                        Facebook
                      </span>
                    </motion.a>
                    <motion.a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center bg-pink-50 hover:bg-pink-100 p-4 border border-pink-200 rounded-xl transition-all duration-300"
                      variants={staggerItem}
                      href={store?.platforms?.instagram}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon
                        icon={allIcons.brands.faInstagram}
                        iconClassName="text-pink-600 text-2xl mb-2 group-hover:scale-110 transition-transform"
                      />
                      <span
                        className="font-medium text-pink-700 text-sm"
                        style={{ fontFamily: INTER_FONT }}
                      >
                        Instagram
                      </span>
                    </motion.a>
                    <motion.a
                      href={store?.platforms?.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center bg-sky-50 hover:bg-sky-100 p-4 border border-sky-200 rounded-xl transition-all duration-300"
                      variants={staggerItem}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon
                        icon={allIcons.brands.faXTwitter}
                        iconClassName="text-sky-600 text-2xl mb-2 group-hover:scale-110 transition-transform"
                      />
                      <span
                        className="font-medium text-sky-700 text-sm"
                        style={{ fontFamily: INTER_FONT }}
                      >
                        Twitter
                      </span>
                    </motion.a>
                    <motion.a
                      href={tw("https://wa.me/" + store?.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center bg-green-50 hover:bg-green-100 p-4 border border-green-200 rounded-xl transition-all duration-300"
                      variants={staggerItem}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon
                        icon={allIcons.brands.faWhatsapp}
                        iconClassName="text-green-600 text-2xl mb-2 group-hover:scale-110 transition-transform"
                      />
                      <span
                        className="font-medium text-green-700 text-sm"
                        style={{ fontFamily: INTER_FONT }}
                      >
                        WhatsApp
                      </span>
                    </motion.a>
                  </motion.div>
                  {/* Store Contact Information */}
                  {store && (
                    <motion.div
                      className="bg-gradient-to-r from-gray-50 to-blue-50 mt-6 p-4 border rounded-xl"
                      variants={staggerItem}
                    >
                      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                        {store.phone && (
                          <motion.div
                            className="flex items-center"
                            whileHover={{ scale: 1.02 }}
                          >
                            <Icon
                              icon={allIcons.solid.faPhone}
                              iconClassName="text-blue-600 mr-3"
                            />
                            <div>
                              <div
                                className="font-medium text-gray-900 text-sm"
                                style={{ fontFamily: INTER_FONT }}
                              >
                                <Translate content="Phone" />
                              </div>
                              <a
                                href={`tel:${store.phone}`}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                style={{ fontFamily: MONTSERRAT_FONT }}
                              >
                                {store.phone}
                              </a>
                            </div>
                          </motion.div>
                        )}
                        <motion.div
                          className="flex items-center"
                          whileHover={{ scale: 1.02 }}
                        >
                          <Icon
                            icon={allIcons.solid.faEnvelope}
                            iconClassName="text-blue-600 mr-3"
                          />
                          <div>
                            <div
                              className="font-medium text-gray-900 text-sm"
                              style={{ fontFamily: INTER_FONT }}
                            >
                              <Translate content="Email" />
                            </div>
                            <a
                              href="mailto:contact@store.com"
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              style={{ fontFamily: MONTSERRAT_FONT }}
                            >
                              contact@store.com
                            </a>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
                {/* Warranty & Shipping Information */}
                <motion.div
                  className="bg-white shadow-lg p-6 border border-gray-100 rounded-2xl"
                  variants={fadeInRight}
                >
                  <motion.h3
                    className="mb-6 font-bold text-gray-900 text-xl"
                    style={{ fontFamily: PLAYFAIR_FONT }}
                    variants={staggerItem}
                  >
                    <Translate content="Warranty & Shipping" />
                  </motion.h3>
                  <motion.div
                    className="gap-6 grid grid-cols-1 md:grid-cols-2"
                    variants={staggerContainer}
                  >
                    {/* Warranty Information */}
                    <motion.div
                      className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 border border-green-200 rounded-xl"
                      variants={staggerItem}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center mb-3">
                        <Icon
                          icon={allIcons.solid.faShieldAlt}
                          iconClassName="text-green-600 text-xl mr-3"
                        />
                        <h4
                          className="font-semibold text-green-800 text-lg"
                          style={{ fontFamily: INTER_FONT }}
                        >
                          <Translate content="Warranty" />
                        </h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Icon
                            icon={allIcons.solid.faCheck}
                            iconClassName="text-green-600 mr-2"
                          />
                          <span style={{ fontFamily: INTER_FONT }}>
                            <Translate content="12 Month Manufacturer Warranty" />
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Icon
                            icon={allIcons.solid.faCheck}
                            iconClassName="text-green-600 mr-2"
                          />
                          <span style={{ fontFamily: INTER_FONT }}>
                            <Translate content="Defect Protection Coverage" />
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Icon
                            icon={allIcons.solid.faCheck}
                            iconClassName="text-green-600 mr-2"
                          />
                          <span style={{ fontFamily: INTER_FONT }}>
                            <Translate content="Free Repair or Replacement" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                    {/* Shipping Information */}
                    <motion.div
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border border-blue-200 rounded-xl"
                      variants={staggerItem}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center mb-3">
                        <Icon
                          icon={allIcons.solid.faTruck}
                          iconClassName="text-blue-600 text-xl mr-3"
                        />
                        <h4
                          className="font-semibold text-blue-800 text-lg"
                          style={{ fontFamily: INTER_FONT }}
                        >
                          <Translate content="Shipping" />
                        </h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Icon
                            icon={allIcons.solid.faCheck}
                            iconClassName="text-blue-600 mr-2"
                          />
                          <span style={{ fontFamily: INTER_FONT }}>
                            <Translate content="Free Shipping on Orders Over $50" />
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Icon
                            icon={allIcons.solid.faCheck}
                            iconClassName="text-blue-600 mr-2"
                          />
                          <span style={{ fontFamily: INTER_FONT }}>
                            <Translate content="2-3 Business Days Delivery" />
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Icon
                            icon={allIcons.solid.faCheck}
                            iconClassName="text-blue-600 mr-2"
                          />
                          <span style={{ fontFamily: INTER_FONT }}>
                            <Translate content="Package Tracking Available" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                  {/* Additional Services */}
                  <motion.div
                    className="bg-gradient-to-r from-purple-50 to-pink-50 mt-6 p-4 border border-purple-200 rounded-xl"
                    variants={staggerItem}
                  >
                    <h4
                      className="flex items-center mb-3 font-semibold text-purple-800 text-lg"
                      style={{ fontFamily: INTER_FONT }}
                    >
                      <Icon
                        icon={allIcons.solid.faStar}
                        iconClassName="text-purple-600 mr-2"
                      />
                      <Translate content="Additional Services" />
                    </h4>
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
                      <div className="flex items-center">
                        <Icon
                          icon={allIcons.solid.faGift}
                          iconClassName="text-purple-600 mr-2"
                        />
                        <span
                          className="text-purple-700 text-sm"
                          style={{ fontFamily: INTER_FONT }}
                        >
                          <Translate content="Gift Wrapping Available" />
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Icon
                          icon={allIcons.solid.faUndo}
                          iconClassName="text-purple-600 mr-2"
                        />
                        <span
                          className="text-purple-700 text-sm"
                          style={{ fontFamily: INTER_FONT }}
                        >
                          <Translate content="30-Day Easy Returns" />
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Icon
                          icon={allIcons.solid.faHeadset}
                          iconClassName="text-purple-600 mr-2"
                        />
                        <span
                          className="text-purple-700 text-sm"
                          style={{ fontFamily: INTER_FONT }}
                        >
                          <Translate content="Customer Support 24/7" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>{" "}
                {/* Additional Product Features */}
                <motion.div
                  variants={staggerItem}
                  className="space-y-4 pt-6 border-gray-200 border-t"
                >
                  <h4
                    className="font-semibold text-gray-900 text-lg"
                    style={{ fontFamily: INTER_FONT }}
                  >
                    <Translate content="Product Features" />
                  </h4>
                  <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
                    <motion.div
                      className="flex items-center bg-blue-50 p-3 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Icon
                        icon={allIcons.solid.faShieldAlt}
                        iconClassName="text-blue-600 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          <Translate content="Quality Assured" />
                        </div>
                        <div className="text-gray-600 text-xs">
                          <Translate content="100% Authentic Product" />
                        </div>
                      </div>
                    </motion.div>
                    <motion.div
                      className="flex items-center bg-green-50 p-3 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Icon
                        icon={allIcons.solid.faTruck}
                        iconClassName="text-green-600 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          <Translate content="Fast Delivery" />
                        </div>
                        <div className="text-gray-600 text-xs">
                          <Translate content="Quick & Reliable Shipping" />
                        </div>
                      </div>
                    </motion.div>
                    <motion.div
                      className="flex items-center bg-purple-50 p-3 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Icon
                        icon={allIcons.solid.faUndo}
                        iconClassName="text-purple-600 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          <Translate content="Easy Returns" />
                        </div>
                        <div className="text-gray-600 text-xs">
                          <Translate content="30-Day Return Policy" />
                        </div>
                      </div>
                    </motion.div>
                    <motion.div
                      className="flex items-center bg-orange-50 p-3 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Icon
                        icon={allIcons.solid.faHeadset}
                        iconClassName="text-orange-600 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          <Translate content="24/7 Support" />
                        </div>
                        <div className="text-gray-600 text-xs">
                          <Translate content="Customer Service Available" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
                {/* Store Information Quick View */}
                {store && (
                  <motion.div
                    variants={staggerItem}
                    className="space-y-4 pt-6 border-gray-200 border-t"
                  >
                    <h4
                      className="font-semibold text-gray-900 text-lg"
                      style={{ fontFamily: INTER_FONT }}
                    >
                      <Translate content="Store Information" />
                    </h4>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border border-blue-200 rounded-xl">
                      <div className="flex items-start space-x-4">
                        {store.photo && (
                          <img
                            src={store.photo}
                            alt={store.name}
                            className="shadow-md rounded-xl w-16 h-16 object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h5
                            className="font-bold text-gray-900 text-lg"
                            style={{ fontFamily: PLAYFAIR_FONT }}
                          >
                            {store.name}
                          </h5>
                          {store.phone && (
                            <motion.a
                              href={`tel:${store.phone}`}
                              className="flex items-center mt-2 text-blue-600 hover:text-blue-800 transition-colors"
                              whileHover={{ scale: 1.02 }}
                            >
                              <Icon
                                icon={allIcons.solid.faPhone}
                                iconClassName="mr-2"
                              />
                              <span style={{ fontFamily: INTER_FONT }}>
                                {store.phone}
                              </span>
                            </motion.a>
                          )}
                          {store.address && (
                            <div className="flex items-center mt-2 text-gray-600">
                              <Icon
                                icon={allIcons.solid.faMapMarkerAlt}
                                iconClassName="mr-2"
                              />
                              <span style={{ fontFamily: INTER_FONT }}>
                                <Translate content="Store Location Available" />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </div>
          {/* Enhanced Description Section with Tabs */}
          <motion.div
            className="bg-gradient-to-br from-gray-50 to-white border-gray-200 border-t"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="mx-auto px-8 py-12 max-w-7xl">
              {/* Tab Navigation */}
              <div className="flex justify-center mb-8">
                <div className="flex bg-white shadow-lg p-2 rounded-2xl">
                  {(["description", "specs", "reviews"] as const).map((tab) => (
                    <motion.button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={tw(
                        "px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 relative",
                        activeTab === tab
                          ? "text-white"
                          : "text-gray-600 hover:text-gray-800"
                      )}
                      style={{ fontFamily: INTER_FONT }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {activeTab === tab && (
                        <motion.div
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: `linear-gradient(135deg, ${BRAND_COLOR_SECONDARY}, ${BRAND_COLOR_LIGHT})`,
                          }}
                          layoutId="activeTab"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                      <span className="z-10 relative">
                        <Translate
                          content={tab.charAt(0).toUpperCase() + tab.slice(1)}
                        />
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mx-auto max-w-4xl"
                >
                  {activeTab === "description" && (
                    <motion.div className="space-y-6">
                      <h3
                        className="font-bold text-gray-900 text-2xl text-center"
                        style={{ fontFamily: PLAYFAIR_FONT }}
                      >
                        <Translate content="Product Description" />
                      </h3>
                      {product.description ? (
                        <div className="space-y-4">
                          {/* Enhanced Markdown Content */}
                          <motion.div
                            className="bg-white shadow-lg p-8 rounded-xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <MarkdownRenderer content={product.description} />
                          </motion.div>
                          {/* Additional description features */}
                          <div className="gap-6 grid md:grid-cols-2 mt-8">
                            <motion.div
                              className="bg-white shadow-md p-6 rounded-xl"
                              whileHover={{ scale: 1.02, y: -5 }}
                            >
                              <Icon
                                icon={allIcons.solid.faShieldAlt}
                                iconClassName="text-blue-600 text-2xl mb-3"
                              />
                              <h4 className="mb-2 font-semibold text-gray-900 text-lg">
                                <Translate content="Quality Guarantee" />
                              </h4>
                              <p className="text-gray-600">
                                <Translate content="We ensure the highest quality standards for all our products." />
                              </p>
                            </motion.div>
                            <motion.div
                              className="bg-white shadow-md p-6 rounded-xl"
                              whileHover={{ scale: 1.02, y: -5 }}
                            >
                              <Icon
                                icon={allIcons.solid.faTruck}
                                iconClassName="text-green-600 text-2xl mb-3"
                              />
                              <h4 className="mb-2 font-semibold text-gray-900 text-lg">
                                <Translate content="Fast Delivery" />
                              </h4>
                              <p className="text-gray-600">
                                <Translate content="Quick and reliable delivery to your doorstep." />
                              </p>
                            </motion.div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <Icon
                            icon={allIcons.solid.faInfoCircle}
                            iconClassName="text-gray-400 text-4xl mb-4"
                          />
                          <p className="text-gray-500 text-lg">
                            <Translate content="No description available for this product." />
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                  {activeTab === "specs" && (
                    <motion.div className="space-y-6">
                      <h3
                        className="font-bold text-gray-900 text-2xl text-center"
                        style={{ fontFamily: PLAYFAIR_FONT }}
                      >
                        <Translate content="Specifications" />
                      </h3>
                      <div className="bg-white shadow-lg p-8 rounded-xl">
                        <div className="gap-4 grid">
                          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                            <span className="font-medium text-gray-700">
                              <Translate content="Product Type" />:
                            </span>
                            <span className="font-semibold text-gray-900 capitalize">
                              {product.type || "Single"}
                            </span>
                          </div>
                          {product.brandId && (
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                              <span className="font-medium text-gray-700">
                                <Translate content="Brand" />:
                              </span>
                              <span className="font-semibold text-gray-900">
                                {brandLabel}
                              </span>
                            </div>
                          )}
                          {product.quantity !== undefined && (
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                              <span className="font-medium text-gray-700">
                                <Translate content="Available Quantity" />:
                              </span>
                              <span className="font-semibold text-gray-900">
                                {product.quantity}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {activeTab === "reviews" && (
                    <motion.div className="space-y-6">
                      <h3
                        className="font-bold text-gray-900 text-2xl text-center"
                        style={{ fontFamily: PLAYFAIR_FONT }}
                      >
                        <Translate content="Customer Reviews" />
                      </h3>
                      <div className="py-12 text-center">
                        <Icon
                          icon={allIcons.solid.faStar}
                          iconClassName="text-yellow-400 text-4xl mb-4"
                        />
                        <p className="text-gray-500 text-lg">
                          <Translate content="No reviews available yet. Be the first to review this product!" />
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
          {/* Product Suggestions Section */}
          <ProductSuggestions
            currentProductId={product?.id}
            currentBrandId={product?.brandId}
          />
        </motion.div>
      </div>
      {/* Buy Now Checkout Modal */}
      <CheckoutInformation
        isOpen={showBuyNowCheckout}
        onClose={() => setShowBuyNowCheckout(false)}
        totalPrice={getBuyNowTotalPrice()}
        deliveryFee={0} // You can adjust this based on your business logic
        cart={getBuyNowCart()}
      />
    </motion.div>
  );
};
