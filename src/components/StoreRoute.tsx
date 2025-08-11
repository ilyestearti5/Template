import { setTemp, useAsyncMemo, useCopyState } from "@biqpod/app/ui/hooks";
import { api } from "../api";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { allIcons } from "@biqpod/app/ui/apis";
import { Icon, IconProps, Translate } from "@biqpod/app/ui/components";
import { fuzzySearch, tw } from "@biqpod/app/ui/utils";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
  useParams,
} from "react-router-dom";
import {
  initCart,
  initFavorites,
  useFavoritesCount,
  useCartCounts,
} from "../hooks";
import { Button } from "./Custom";
import { icons, getProductPrice } from "./utils";
import { CustomCartView } from "./CartPage";
import { CollectionProducts } from "./CollectionProducts";
import { ProductCard } from "./ProductCard";
import { SearchProductCard } from "./SearchProductCard";
import { FavoritesPage } from "./FavoritesPage";
// Custom Cart Component
// Home Page Component
const HomePage = () => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const history = useHistory();
  const favoritesCount = useFavoritesCount();
  const cartCount = useCartCounts();
  // Search placeholder cycling with typing animation
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  // Initialize cart and favorites

  // Ref for featured products scrolling
  const featuredProductsRef = useRef<HTMLDivElement>(null);
  const [canScrollFeaturedLeft, setCanScrollFeaturedLeft] = useState(false);
  const [canScrollFeaturedRight, setCanScrollFeaturedRight] = useState(true);
  const checkFeaturedScrollability = () => {
    if (featuredProductsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        featuredProductsRef.current;
      setCanScrollFeaturedLeft(scrollLeft > 0);
      setCanScrollFeaturedRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };
  const scrollFeaturedLeft = () => {
    if (featuredProductsRef.current) {
      featuredProductsRef.current.scrollBy({
        left: -320,
        behavior: "smooth",
      });
      // Check scrollability after animation
      setTimeout(checkFeaturedScrollability, 300);
    }
  };
  const scrollFeaturedRight = () => {
    if (featuredProductsRef.current) {
      featuredProductsRef.current.scrollBy({
        left: 320,
        behavior: "smooth",
      });
      // Check scrollability after animation
      setTimeout(checkFeaturedScrollability, 300);
    }
  };
  // Hero banner images
  const bannerImages = useMemo(() => {
    return [
      "https://f.nooncdn.com/mpcms/EN0111/assets/66236654-4b65-4a1d-87f0-a89323fad3c1.png?format=webp",
      "https://f.nooncdn.com/mpcms/EN0111/assets/6a55b066-cad8-40e0-a90c-02ba219d67f7.jpg?format=webp",
      "https://f.nooncdn.com/mpcms/EN0112/assets/761a6007-9ef7-4af3-8bb9-e3ffceecae1d.png?format=webp",
    ];
  }, []);
  // Auto-slide banner images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) =>
        prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);
  const store = useAsyncMemo(async () => {
    return api.getStore();
  }, []);
  // Fetch collections for this store
  const collections = useAsyncMemo(async () => {
    return api.getCollections();
  }, []);
  // Fetch products for this store
  const products = useAsyncMemo(async () => {
    const products = await api.getProducts();
    return products;
  }, []);
  // Fetch brands for this store
  const brands = useAsyncMemo(async () => {
    return api.getAllBrands();
  }, []);
  // Fetch offers/packs for this store
  const offers = useAsyncMemo(async () => {
    return api.getPacks();
  }, []);
  // Get featured products (first 8 products)
  const featuredProducts = useMemo(() => {
    return products?.slice(0, 8) || [];
  }, [products]);
  // Check featured products scrollability when they change
  useEffect(() => {
    checkFeaturedScrollability();
  }, [featuredProducts]);
  const searchValue = useCopyState("");
  // Dynamic search placeholders based on store data
  const searchPlaceholders = useMemo(() => {
    const placeholders: string[] = [];
    // Add brand names
    if (brands && brands.length > 0) {
      brands.slice(0, 4).forEach((brand) => {
        if (brand.name) {
          placeholders.push(brand.name);
        }
      });
    }
    // Add collection names
    if (collections && collections.length > 0) {
      collections.slice(0, 3).forEach((collection) => {
        if (collection.name) {
          placeholders.push(collection.name);
        }
      });
    }
    // Add product categories based on actual products
    if (products && products.length > 0) {
      const categories = new Set<string>();
      products.forEach((product) => {
        if (
          product.metaData?.category &&
          typeof product.metaData.category === "string"
        ) {
          categories.add(product.metaData.category);
        }
      });
      Array.from(categories)
        .slice(0, 3)
        .forEach((category) => {
          placeholders.push(category);
        });
    }
    // Add some popular product names
    if (products && products.length > 0) {
      products.slice(0, 3).forEach((product) => {
        if (product.name) {
          placeholders.push(product.name.split(" ").slice(0, 2).join(" "));
        }
      });
    }
    // Fallback placeholders if no data available
    if (placeholders.length === 0) {
      return ["Products", "Brands", "Collections", "Offers"];
    }
    return placeholders;
  }, [brands, collections, products]);
  // Typing animation effect
  useEffect(() => {
    if (searchPlaceholders.length === 0) return;
    const currentPlaceholder = searchPlaceholders[currentPlaceholderIndex];
    let currentIndex = 0;
    setTypedText("");
    setIsTyping(true);
    const typingInterval = setInterval(() => {
      if (currentIndex <= currentPlaceholder.length) {
        setTypedText(currentPlaceholder.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        // Wait 2 seconds before moving to next placeholder
        setTimeout(() => {
          setCurrentPlaceholderIndex((prev) =>
            prev === searchPlaceholders.length - 1 ? 0 : prev + 1
          );
        }, 2000);
      }
    }, 100); // Type one character every 100ms
    return () => clearInterval(typingInterval);
  }, [currentPlaceholderIndex, searchPlaceholders]);
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Offers Banner - Show if there are offers */}
      {offers && offers.length > 0 && (
        <div
          className="py-3"
          style={{
            background: "linear-gradient(to right, #89CFF0, #5DADE2)",
          }}
        >
          <div className="mx-auto px-4 max-w-7xl">
            <div className="flex justify-center items-center gap-4 text-white">
              <span className="text-2xl animate-bounce">🔥</span>
              <span
                className="font-bold text-lg"
                style={{ fontFamily: "Oswald, sans-serif" }}
              >
                SPECIAL OFFERS AVAILABLE - {offers.length} PACK
                {offers.length > 1 ? "S" : ""} ON SALE!
              </span>
              <span className="text-2xl animate-bounce">🔥</span>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="top-0 z-50 sticky bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1
                className="font-bold text-gray-900 text-2xl uppercase tracking-wide"
                style={{ fontFamily: "Oswald, sans-serif" }}
              >
                {store?.name || "SnapBuy"}
              </h1>
            </div>
            <nav
              className="flex items-center gap-2"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {/* Search Button */}
              <button
                onClick={() => {
                  setShowSearch((s) => !s);
                }}
                className="flex-1 hover:bg-gray-100 rounded-full w-[40px] h-[40px] text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Icon
                  icon={showSearch ? allIcons.solid.faXmark : icons.search}
                  iconClassName={tw(
                    "text-xl transition-transform",
                    showSearch && "rotate-90"
                  )}
                />
              </button>
              {/* Favorites Button */}
              <button
                onClick={() => history.push("/favorites")}
                className="relative flex justify-center items-center hover:bg-gray-100 rounded-full w-[40px] h-[40px] text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Icon
                  icon={
                    favoritesCount > 0
                      ? allIcons.solid.faHeart
                      : allIcons.regular.faHeart
                  }
                  iconClassName={tw(
                    "text-xl transition-colors",
                    favoritesCount > 0 ? "text-red-500" : ""
                  )}
                />
                {favoritesCount > 0 && (
                  <span className="top-0 right-0 absolute flex justify-center items-center bg-red-500 rounded-full w-5 h-5 font-bold text-white text-xs">
                    {favoritesCount > 99 ? "99+" : favoritesCount}
                  </span>
                )}
              </button>
              {/* Cart Button */}
              <button
                onClick={() => history.push("/cart")}
                className="relative flex justify-center items-center hover:bg-gray-100 rounded-full w-[40px] h-[40px] text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Icon icon={icons.shoppingCart} iconClassName="text-xl" />
                {cartCount > 0 && (
                  <span className="top-0 right-0 absolute flex justify-center items-center bg-blue-500 rounded-full w-5 h-5 font-bold text-white text-xs">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
              {/* Notification Test Button */}
            </nav>
          </div>
        </div>
      </header>
      {/* Search Section - Only show when showSearch is true */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-gray-100 py-8"
          >
            <div className="mx-auto px-4 max-w-7xl">
              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className="mb-6"
              >
                <div className="relative mx-auto max-w-2xl">
                  <input
                    value={searchValue.get}
                    onChange={(e) => searchValue.set(e.target.value)}
                    type="text"
                    placeholder={`Search For ${typedText}${
                      isTyping ? "|" : ""
                    }`}
                    className="px-4 py-3 pr-12 rounded-lg ring-2 ring-gray-400 w-full text-lg"
                    style={{
                      fontFamily: "Inter, sans-serif",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#89CFF0")}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                    autoFocus
                  />
                  <button
                    className="top-1/2 right-3 absolute text-gray-400 hover:text-gray-600 -translate-y-1/2 transform"
                    onClick={() => {
                      setTemp("search-for-product", searchValue.get);
                      history.push("/search");
                    }}
                  >
                    <Icon icon={icons.search} iconClassName="text-xl" />
                  </button>
                  <button
                    onClick={() => setShowSearch(false)}
                    className="top-1/2 right-12 absolute text-gray-400 hover:text-gray-600 text-sm -translate-y-1/2 transform"
                  >
                    <Translate content="Cancel" />
                  </button>
                </div>
              </motion.div>
              {/* Category Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                className="flex justify-center mb-6"
              >
                <div className="flex space-x-8">
                  <button className="pb-2 hover:border-gray-300 border-transparent border-b-2 font-medium text-gray-600 hover:text-gray-900">
                    <Translate content="All" />
                  </button>
                  <button className="pb-2 border-gray-900 border-b-2 font-medium text-gray-900">
                    <Translate content="Women" />
                  </button>
                  <button className="pb-2 hover:border-gray-300 border-transparent border-b-2 font-medium text-gray-600 hover:text-gray-900">
                    <Translate content="Men" />
                  </button>
                  <button className="pb-2 hover:border-gray-300 border-transparent border-b-2 font-medium text-gray-600 hover:text-gray-900">
                    <Translate content="Kids" />
                  </button>
                </div>
              </motion.div>
              {/* Trending Searches */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                className="text-center"
              >
                <h3 className="mb-4 font-semibold text-gray-900 text-lg">
                  <Translate content="Trending Searches" />
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    "mango",
                    "bag",
                    "tote bag",
                    "dresses",
                    "wallet",
                    "sunglasses",
                    "top",
                    "watch",
                    "linen",
                    "bags",
                  ].map((term, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.4 + index * 0.05,
                        ease: "easeOut",
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1 bg-white hover:bg-gray-50 px-4 py-2 border border-gray-300 hover:border-gray-400 rounded-full text-gray-700 transition-colors"
                      style={{ fontFamily: "Inter, sans-serif" }}
                      onClick={() => {
                        // Handle trending search click
                        console.log("Trending search:", term);
                      }}
                    >
                      <Icon icon={allIcons.solid.faChartLine} />
                      {term}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Hero Banner */}
      <div className="relative h-96 overflow-hidden">
        {/* Banner Images Container */}
        <div
          className="flex h-full transition-transform duration-1000 ease-in-out"
          style={{
            width: `${bannerImages.length * 100}%`,
            transform: `translateX(-${
              currentBannerIndex * (100 / bannerImages.length)
            }%)`,
          }}
        >
          {bannerImages.map((image, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 h-full"
              style={{
                width: `${100 / bannerImages.length}%`,
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>
          ))}
        </div>
        {/* Banner Content Overlay */}
        <div className="absolute inset-0 flex justify-center items-center mx-auto px-4 w-full max-w-7xl">
          <div className="max-w-lg text-center">
            <h2
              className="mb-4 font-bold text-white text-4xl md:text-6xl"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              <Translate content="Summer" />
              <br />
              <span style={{ color: "#89CFF0" }}>
                <Translate content="Final Call" />
              </span>
            </h2>
            <p
              className="mb-6 text-white text-xl"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <Translate content="This Season's Best" />
            </p>
            <Button
              className="px-8 py-3 rounded-none font-medium text-white text-lg tracking-wide"
              style={{
                fontFamily: "Montserrat, sans-serif",
                backgroundColor: "#89CFF0",
              }}
            >
              <Translate content="Shop Now" />
            </Button>
          </div>
        </div>
        {/* Banner Indicators */}
        <div className="bottom-4 left-1/2 absolute flex space-x-2 -translate-x-1/2 transform">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentBannerIndex === index
                  ? "bg-white"
                  : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
        <div className="hidden md:block top-0 right-0 absolute w-1/2 h-full pointer-events-none">
          <div
            className="flex justify-center items-center h-full"
            style={{
              background:
                "linear-gradient(to left, rgba(137, 207, 240, 0.3), transparent)",
            }}
          >
            <div className="flex justify-center items-center bg-white/90 shadow-2xl rounded-full w-80 h-80">
              <div style={{ color: "#89CFF0" }}>
                <Icon icon={icons.user} iconClassName="text-6xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Brands Section */}
      <div className="bg-white py-8">
        <div className="mx-auto px-4 max-w-7xl">
          <h2
            className="mb-6 font-bold text-gray-900 text-2xl text-center"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            BRANDS TO{" "}
            <span className="bg-gradient-to-r from-blue-200 to-blue-300 italic">
              BAG
            </span>
          </h2>
          <div className="flex justify-center gap-3 pb-2 overflow-x-auto scrollbar-hide">
            {brands?.slice(0, 8).map((brand, index) => (
              <div
                key={brand.id}
                className={`flex-shrink-0 px-6 py-3 rounded-full transition-all duration-200 cursor-pointer ${
                  index % 5 === 0
                    ? "bg-gradient-to-r from-pink-200 to-pink-300 hover:from-pink-300 hover:to-pink-400"
                    : index % 5 === 1
                    ? "bg-gradient-to-r from-blue-200 to-blue-300 hover:from-blue-300 hover:to-blue-400"
                    : index % 5 === 2
                    ? "bg-gradient-to-r from-purple-200 to-purple-300 hover:from-purple-300 hover:to-purple-400"
                    : index % 5 === 3
                    ? "bg-gradient-to-r from-green-200 to-green-300 hover:from-green-300 hover:to-green-400"
                    : "bg-gradient-to-r from-yellow-200 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400"
                }`}
                onClick={() => {
                  // Handle brand click - could filter products by brand
                  console.log("Brand clicked:", brand.name);
                }}
              >
                <div className="flex items-center gap-3">
                  {brand.photo && (
                    <img
                      src={brand.photo}
                      alt={brand.name}
                      className="h-8 object-contain"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Collections Section */}
      <div className="mx-auto px-4 py-12 max-w-7xl">
        <h2
          className="mb-8 font-bold text-gray-900 text-3xl text-center"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          <Translate content="Shop by Collections" />
        </h2>
        <div className="flex justify-center gap-8 overflow-x-auto scrollbar-hide">
          {collections?.map((collection) => {
            return (
              <div
                key={collection.id}
                className="group flex flex-col gap-2 text-center hover:scale-105 transition-all duration-200 cursor-pointer"
                onClick={() => {
                  history.push(`/collection/${collection.id}`);
                }}
              >
                <div className="shadow-lg group-hover:shadow-xl mx-auto rounded-full w-20 h-20 overflow-hidden transition-all duration-300">
                  <img
                    src={collection.photo}
                    alt={collection.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3
                  className="font-semibold text-gray-800 group-hover:text-blue-600 text-sm transition-colors"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {collection.name}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
      {/* Featured Products Section */}
      {featuredProducts && featuredProducts.length > 0 && (
        <div className="bg-white mx-auto px-4 py-12 max-w-7xl">
          <h2
            className="mb-8 font-bold text-gray-900 text-3xl text-center"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            <Translate content="Featured Products" />
          </h2>
          <div className="relative">
            {/* Left Navigation Button */}
            {canScrollFeaturedLeft && (
              <button
                onClick={scrollFeaturedLeft}
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
            {canScrollFeaturedRight && (
              <button
                onClick={scrollFeaturedRight}
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
              ref={featuredProductsRef}
              className="relative flex items-center gap-4 pb-4 overflow-x-auto scrollbar-hide"
              style={{ scrollBehavior: "smooth" }}
              onScroll={checkFeaturedScrollability}
            >
              {featuredProducts.map((product) => (
                <div key={product.id} className="flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Collection Products Section */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto px-4 max-w-7xl">
          {collections?.map((collection) => {
            return (
              <CollectionProducts collection={collection} key={collection.id} />
            );
          })}
        </div>
      </div>
      {/* Offers Section */}
      {offers && offers.length > 0 && (
        <div
          className="py-8"
          style={{
            background: "linear-gradient(to right, #E3F2FD, #BBDEFB)",
          }}
        >
          <div className="mx-auto px-4 max-w-7xl text-center">
            <h2
              className="mb-8 font-bold text-gray-900 text-4xl md:text-5xl tracking-wider"
              style={{ fontFamily: "Oswald, sans-serif" }}
            >
              🔥 <Translate content="Special Offers" />
            </h2>
            <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white hover:shadow-lg border border-gray-300 border-solid transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    history.push(`/offer/${offer.id}`);
                  }}
                >
                  <div
                    className="p-6 text-white"
                    style={{
                      background: "linear-gradient(to right, #89CFF0, #5DADE2)",
                    }}
                  >
                    <h3
                      className="mb-2 font-bold text-2xl"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {offer.name}
                    </h3>
                    <div className="flex justify-center items-center gap-2">
                      <span className="font-bold text-3xl">
                        {offer.price} DA
                      </span>
                      <Icon icon={icons.tag} iconClassName="text-lg" />
                    </div>
                    <p className="opacity-90 mt-2 text-sm">
                      {offer.products?.length || 0}{" "}
                      <Translate content="Products Included" />
                    </p>
                  </div>
                  <div className="p-4">
                    <Button
                      className="py-3 rounded-full w-full font-semibold text-white"
                      style={{
                        background:
                          "linear-gradient(to right, #89CFF0, #5DADE2)",
                      }}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation(); // Prevent parent click
                        history.push(`/offer/${offer.id}`);
                      }}
                    >
                      <Translate content="View Offer Details" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Why Choose Us Section */}
      <div className="bg-white py-16">
        <div className="mx-auto px-4 max-w-7xl">
          <div className="mb-12 text-center">
            <h2
              className="mb-4 font-bold text-gray-900 text-3xl md:text-4xl"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              <Translate content="Why Choose SnapBuy?" />
            </h2>
            <p
              className="mx-auto max-w-2xl text-gray-600 text-lg"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Translate content="Experience shopping like never before with our commitment to quality, convenience, and customer satisfaction." />
            </p>
          </div>
          <div className="gap-8 grid grid-cols-1 md:grid-cols-3">
            <div className="group text-center">
              <div className="flex justify-center items-center bg-blue-100 group-hover:bg-blue-200 mx-auto mb-4 rounded-full w-16 h-16 transition-colors duration-300">
                <Icon
                  icon={allIcons.solid.faShippingFast}
                  iconClassName="text-2xl text-blue-600"
                />
              </div>
              <h3
                className="mb-2 font-semibold text-gray-900 text-xl"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <Translate content="Fast Delivery" />
              </h3>
              <p
                className="text-gray-600"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <Translate content="Get your orders delivered quickly to your doorstep with our reliable shipping partners." />
              </p>
            </div>
            <div className="group text-center">
              <div className="flex justify-center items-center bg-green-100 group-hover:bg-green-200 mx-auto mb-4 rounded-full w-16 h-16 transition-colors duration-300">
                <Icon
                  icon={allIcons.solid.faShield}
                  iconClassName="text-2xl text-green-600"
                />
              </div>
              <h3
                className="mb-2 font-semibold text-gray-900 text-xl"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <Translate content="Secure Payment" />
              </h3>
              <p
                className="text-gray-600"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <Translate content="Shop with confidence using our secure payment system that protects your data." />
              </p>
            </div>
            <div className="group text-center">
              <div className="flex justify-center items-center bg-purple-100 group-hover:bg-purple-200 mx-auto mb-4 rounded-full w-16 h-16 transition-colors duration-300">
                <Icon
                  icon={allIcons.solid.faPhone}
                  iconClassName="text-2xl text-purple-600"
                />
              </div>
              <h3
                className="mb-2 font-semibold text-gray-900 text-xl"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <Translate content="24/7 Support" />
              </h3>
              <p
                className="text-gray-600"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <Translate content="Our dedicated customer support team is here to help you anytime you need assistance." />
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Testimonials Section */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto px-4 max-w-7xl">
          <div className="mb-12 text-center">
            <h2
              className="mb-4 font-bold text-gray-900 text-3xl md:text-4xl"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              <Translate content="What Our Customers Say" />
            </h2>
            <p
              className="mx-auto max-w-2xl text-gray-600 text-lg"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Translate content="Don't just take our word for it - hear from our satisfied customers who love shopping with us." />
            </p>
          </div>
          <div className="gap-8 grid grid-cols-1 md:grid-cols-3">
            <motion.div className="bg-white shadow-md hover:shadow-lg p-6 rounded-lg transition-shadow duration-300">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    icon={allIcons.solid.faStar}
                    iconClassName="text-yellow-400"
                  />
                ))}
              </div>
              <p
                className="mb-4 text-gray-700 italic"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                "Amazing quality products and super fast delivery! I'm impressed
                with the customer service too."
              </p>
              <div className="flex items-center gap-3">
                <div className="flex justify-center items-center bg-blue-100 rounded-full w-10 h-10">
                  <span className="font-semibold text-blue-600">S</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Sarah M.</h4>
                  <p className="text-gray-600 text-sm">Verified Customer</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white shadow-md hover:shadow-lg p-6 rounded-lg transition-shadow duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    icon={allIcons.solid.faStar}
                    iconClassName="text-yellow-400"
                  />
                ))}
              </div>
              <p
                className="mb-4 text-gray-700 italic"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                "Love the variety of products and the easy shopping experience.
                Highly recommended!"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex justify-center items-center bg-green-100 rounded-full w-10 h-10">
                  <span className="font-semibold text-green-600">A</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Ahmed K.</h4>
                  <p className="text-gray-600 text-sm">Verified Customer</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white shadow-md hover:shadow-lg p-6 rounded-lg transition-shadow duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    icon={allIcons.solid.faStar}
                    iconClassName="text-yellow-400"
                  />
                ))}
              </div>
              <p
                className="mb-4 text-gray-700 italic"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                "Best online shopping experience I've had. The products are
                exactly as described!"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex justify-center items-center bg-purple-100 rounded-full w-10 h-10">
                  <span className="font-semibold text-purple-600">L</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Leila B.</h4>
                  <p className="text-gray-600 text-sm">Verified Customer</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      {/* Statistics Section */}
      <div
        className="py-16"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="mx-auto px-4 max-w-7xl">
          <div className="gap-8 grid grid-cols-2 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-white text-center"
            >
              <div className="mb-2 font-bold text-4xl">10K+</div>
              <div className="text-blue-100">Happy Customers</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white text-center"
            >
              <div className="mb-2 font-bold text-4xl">500+</div>
              <div className="text-blue-100">Products</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-white text-center"
            >
              <div className="mb-2 font-bold text-4xl">50+</div>
              <div className="text-blue-100">Brands</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-white text-center"
            >
              <div className="mb-2 font-bold text-4xl">99%</div>
              <div className="text-blue-100">Satisfaction Rate</div>
            </motion.div>
          </div>
        </div>
      </div>
      <footer className="bg-white border-gray-200 border-t">
        {/* Newsletter Section */}
        <div className="bg-gray-50 py-8">
          <div className="mx-auto px-4 max-w-7xl">
            <div className="flex md:flex-row flex-col justify-between items-center gap-6">
              <div>
                <h3
                  className="mb-2 font-bold text-gray-900 text-2xl"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  <Translate content="Stay in the Loop" />
                </h3>
                <p
                  className="text-gray-600"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <Translate content="Be the first to know about new arrivals and exclusive offers" />
                </p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-gray-300 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-80"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
                <Button
                  className="px-6 py-3 rounded-lg font-semibold text-white whitespace-nowrap"
                  style={{ backgroundColor: "#89CFF0" }}
                >
                  <Translate content="Subscribe" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Main Footer Content */}
        <div className="bg-slate-800 py-12 text-white">
          <div className="mx-auto px-4 max-w-7xl">
            <div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6">
              {/* Brand Column */}
              <div className="lg:col-span-2">
                <h2
                  className="mb-4 font-bold text-white text-2xl uppercase tracking-wide"
                  style={{ fontFamily: "Oswald, sans-serif" }}
                >
                  {store?.name || "SnapBuy"}
                </h2>
                <p
                  className="mb-6 text-gray-300 leading-relaxed"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <Translate content="Your ultimate online shopping destination. Discover the latest trends in fashion, beauty, and lifestyle." />
                </p>
                {/* Contact Information */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Icon
                      icon={allIcons.solid.faPhone}
                      iconClassName="text-blue-400"
                    />
                    <div>
                      <p
                        className="font-semibold text-white text-sm"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        <Translate content="Call Us" />
                      </p>
                      <a
                        href="tel:+213551234567"
                        className="text-gray-300 hover:text-blue-400 transition-colors"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {store?.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon
                      icon={allIcons.solid.faEnvelope}
                      iconClassName="text-blue-400"
                    />
                    <div>
                      <p
                        className="font-semibold text-white text-sm"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        <Translate content="Email Us" />
                      </p>
                      <a
                        href="mailto:support@snapbuy.com"
                        className="text-gray-300 hover:text-blue-400 transition-colors"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        support@snapbuy.com
                      </a>
                    </div>
                  </div>
                </div>
                {/* Social Media Icons */}
                <div className="flex items-center gap-3">
                  <span
                    className="font-semibold text-white text-sm uppercase tracking-wide"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <Translate content="Follow Us" />
                  </span>
                  <div className="flex space-x-2">
                    {Object.entries(store?.platforms || {}).map(
                      ([platformId, url]) => {
                        const platformIcons: Record<string, IconProps["icon"]> =
                          {
                            facebook: allIcons.brands.faFacebook,
                            instagram: allIcons.brands.faInstagram,
                            x: allIcons.brands.faTwitter,
                            youtube: allIcons.brands.faYoutube,
                            tiktok: allIcons.brands.faTiktok,
                            pinterest: allIcons.brands.faPinterest,
                            linkedin: allIcons.brands.faLinkedin,
                            snapchat: allIcons.brands.faSnapchatGhost,
                          };
                        return (
                          <button
                            key={platformId}
                            onClick={() => {
                              if (url) {
                                window.open(url, "_blank");
                              }
                            }}
                            className="flex justify-center items-center bg-gray-700 hover:bg-gray-600 rounded-full w-10 h-10 text-gray-300 hover:text-white transition-all duration-200"
                          >
                            <Icon
                              icon={platformIcons[platformId]}
                              iconClassName="text-lg"
                            />
                          </button>
                        );
                      }
                    )}
                    <button
                      onClick={async () => {
                        if (!store?.name) {
                          return;
                        }
                        const uri = new URL(location.origin);
                        uri.pathname = "/client/stores/" + store.id;
                        navigator.share({
                          title: store?.name,
                          url: uri.toString(),
                        });
                      }}
                      className="flex justify-center items-center bg-gray-700 hover:bg-gray-600 rounded-full w-10 h-10 text-gray-300 hover:text-white transition-all duration-200"
                    >
                      <Icon icon={icons.share} iconClassName="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Shop Column */}
              <div>
                <h3
                  className="mb-4 font-semibold text-white text-sm uppercase tracking-wide"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <Translate content="Shop" />
                </h3>
                <ul
                  className="space-y-3 text-gray-300"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      <Translate content="Women" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      <Translate content="Men" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      <Translate content="Kids" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      <Translate content="Sale" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      <Translate content="New Arrivals" />
                    </a>
                  </li>
                </ul>
              </div>
              {/* Customer Service Column */}
              <div>
                <h3
                  className="mb-4 font-semibold text-white text-sm uppercase tracking-wide"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <Translate content="Customer Service" />
                </h3>
                <ul
                  className="space-y-3 text-gray-300"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      <Translate content="Contact Us" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      <Translate content="Size Guide" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      <Translate content="Returns & Exchanges" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      <Translate content="Shipping Info" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      <Translate content="Track Your Order" />
                    </a>
                  </li>
                </ul>
              </div>
              {/* About Column */}
              <div>
                <h3
                  className="mb-4 font-semibold text-white text-sm uppercase tracking-wide"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <Translate content="About" />
                </h3>
                <ul
                  className="space-y-3 text-gray-300"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      <Translate content="About Us" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      <Translate content="Careers" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      <Translate content="Press" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      <Translate content="Sustainability" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      <Translate content="Gift Cards" />
                    </a>
                  </li>
                </ul>
              </div>
              {/* App Download Column */}
              {/* <div>
                  <h3
                    className="mb-4 font-semibold text-gray-900 text-sm uppercase tracking-wide"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <Translate content="Download App" />
                  </h3>
                  <div className="space-y-3">
                    <a
                      href="#"
                      className="block hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-3 bg-black hover:bg-gray-800 px-4 py-2 rounded-lg text-white transition-colors">
                        <Icon
                          icon={allIcons.brands.faApple}
                          iconClassName="text-2xl"
                        />
                        <div>
                          <div className="text-xs">Download on the</div>
                          <div className="font-semibold text-sm">App Store</div>
                        </div>
                      </div>
                    </a>
                    <a
                      href="#"
                      className="block hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-3 bg-black hover:bg-gray-800 px-4 py-2 rounded-lg text-white transition-colors">
                        <Icon
                          icon={allIcons.brands.faGooglePlay}
                          iconClassName="text-2xl"
                        />
                        <div>
                          <div className="text-xs">Get it on</div>
                          <div className="font-semibold text-sm">
                            Google Play
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div> */}
            </div>
          </div>
        </div>
        {/* Payment Methods Section */}
        <div className="bg-sky-50 py-6">
          <div className="mx-auto px-4 max-w-7xl">
            <div className="flex md:flex-row flex-col justify-between items-center gap-4">
              <div className="flex items-center gap-6">
                <span
                  className="font-semibold text-gray-900 text-sm uppercase tracking-wide"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <Translate content="We Accept" />
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex justify-center items-center bg-white px-3 py-2 border border-gray-200 rounded w-12 h-8">
                    <Icon
                      icon={allIcons.brands.faCcVisa}
                      iconClassName="text-blue-600 text-lg"
                    />
                  </div>
                  <div className="flex justify-center items-center bg-white px-3 py-2 border border-gray-200 rounded w-12 h-8">
                    <Icon
                      icon={allIcons.brands.faCcMastercard}
                      iconClassName="text-red-500 text-lg"
                    />
                  </div>
                  <div className="flex justify-center items-center bg-white px-3 py-2 border border-gray-200 rounded w-12 h-8">
                    <Icon
                      icon={allIcons.brands.faCcPaypal}
                      iconClassName="text-blue-500 text-lg"
                    />
                  </div>
                  <div className="flex justify-center items-center bg-white px-3 py-2 border border-gray-200 rounded w-12 h-8">
                    <Icon
                      icon={allIcons.brands.faApplePay}
                      iconClassName="text-gray-800 text-lg"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-600 text-sm">
                <a href="#" className="hover:text-gray-900 transition-colors">
                  <Translate content="Privacy Policy" />
                </a>
                <span>•</span>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  <Translate content="Terms of Service" />
                </a>
                <span>•</span>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  <Translate content="Cookie Policy" />
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Copyright Section */}
        <div className="bg-gray-100 py-4">
          <div className="mx-auto px-4 max-w-7xl">
            <div className="flex md:flex-row flex-col justify-between items-center gap-4">
              <p
                className="text-gray-600 text-sm"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                &copy; 2024 {store?.name || "SnapBuy"}.{" "}
                <Translate content="All rights reserved." />
              </p>
              <p
                className="text-gray-600 text-sm"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <Translate content="Made with" /> ❤️{" "}
                <Translate content="for fashion lovers" />
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
// Search Products Page Component
const SearchPage = () => {
  const [sortBy, setSortBy] = useState("recommended");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
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
  const [appliedBrands, setAppliedBrands] = useState<string[]>([]);
  const [appliedSizes, setAppliedSizes] = useState<string[]>([]);
  const [appliedColors, setAppliedColors] = useState<string[]>([]);
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | "">("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | "">("");
  const [appliedDeliveryTypes, setAppliedDeliveryTypes] = useState<string[]>(
    []
  );
  // Pending filters (these are modified in the UI but not yet applied)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [selectedDeliveryTypes, setSelectedDeliveryTypes] = useState<string[]>(
    []
  );
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
    setAppliedBrands(selectedBrands);
    setAppliedSizes(selectedSizes);
    setAppliedColors(selectedColors);
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    setAppliedDeliveryTypes(selectedDeliveryTypes);
  };
  // Clear all filters function
  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setMinPrice("");
    setMaxPrice("");
    setSelectedDeliveryTypes([]);
    setAppliedBrands([]);
    setAppliedSizes([]);
    setAppliedColors([]);
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
    setAppliedDeliveryTypes([]);
  };
  // Check if there are pending changes
  const hasPendingChanges = useMemo(() => {
    return (
      JSON.stringify(selectedBrands) !== JSON.stringify(appliedBrands) ||
      JSON.stringify(selectedSizes) !== JSON.stringify(appliedSizes) ||
      JSON.stringify(selectedColors) !== JSON.stringify(appliedColors) ||
      minPrice !== appliedMinPrice ||
      maxPrice !== appliedMaxPrice ||
      JSON.stringify(selectedDeliveryTypes) !==
        JSON.stringify(appliedDeliveryTypes)
    );
  }, [
    selectedBrands,
    appliedBrands,
    selectedSizes,
    appliedSizes,
    selectedColors,
    appliedColors,
    minPrice,
    appliedMinPrice,
    maxPrice,
    appliedMaxPrice,
    selectedDeliveryTypes,
    appliedDeliveryTypes,
  ]);
  const toggleBrandFilter = (brandId: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };
  const toggleSizeFilter = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };
  const toggleColorFilter = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };
  const toggleDeliveryFilter = (deliveryType: string) => {
    setSelectedDeliveryTypes((prev) =>
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
  const searchValue = useCopyState("");
  // Filtered products based on all applied filters
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let filtered = products.filter((product) =>
      fuzzySearch(searchValue.get, product.name || "")
    );
    // Filter by brand
    if (appliedBrands.length > 0) {
      filtered = filtered.filter((product) =>
        appliedBrands.includes(product.brandId || "")
      );
    }
    // Filter by size (from product.metaData.sizes)
    if (appliedSizes.length > 0) {
      filtered = filtered.filter((product) => {
        const productSizes = product.metaData?.sizes;
        if (!productSizes || typeof productSizes !== "object") return false;
        if (Array.isArray(productSizes)) {
          return appliedSizes.some((size) =>
            (productSizes as string[]).includes(size)
          );
        }
        return false;
      });
    }
    // Filter by color (from product.metaData.colors)
    if (appliedColors.length > 0) {
      filtered = filtered.filter((product) => {
        const productColors = product.metaData?.colors;
        if (!productColors || typeof productColors !== "object") return false;
        if (Array.isArray(productColors)) {
          return appliedColors.some((color) =>
            (productColors as string[]).some((productColor: string) =>
              productColor.toLowerCase().includes(color.toLowerCase())
            )
          );
        }
        return false;
      });
    }
    // Filter by price range (min/max)
    if (appliedMinPrice !== "" || appliedMaxPrice !== "") {
      filtered = filtered.filter((product) => {
        const price =
          product.type === "single"
            ? product.single?.price || 0
            : Math.min(
                ...(product.multiple?.prices?.map((p) => p.price) || [0])
              );
        const min = appliedMinPrice === "" ? 0 : Number(appliedMinPrice);
        const max = appliedMaxPrice === "" ? Infinity : Number(appliedMaxPrice);
        return price >= min && price <= max;
      });
    }
    // Filter by delivery type (assuming all products have free delivery for now)
    if (appliedDeliveryTypes.length > 0) {
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
    searchValue.get,
    appliedBrands,
    appliedSizes,
    appliedColors,
    appliedMinPrice,
    appliedMaxPrice,
    appliedDeliveryTypes,
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
    <div className="bg-white min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="bg-gray-50 py-3 border-gray-200 border-b">
        <div className="mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <a
              onClick={() => {
                history.push("/");
              }}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              <Translate content="Home" />
            </a>
            <Icon
              icon={allIcons.solid.faChevronRight}
              iconClassName="text-xs"
            />
            <span
              className="font-medium text-gray-900"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Translate content="Search Results" />
            </span>
          </div>
        </div>
      </div>
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
                {searchValue.get}
              </span>
            </h1>
            <div className="flex items-center gap-4 text-gray-600 text-sm">
              <span style={{ fontFamily: "Roboto, sans-serif" }}>
                <Translate content="Showing" /> {filteredProducts.length}{" "}
                <Translate content="Results" />
              </span>
            </div>
          </div>
          {/* Sort Options */}
          <div className="flex items-center gap-4">
            <span
              className="text-gray-600 text-sm"
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
                    ?.label || "Recommended"}
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
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="flex-shrink-0 w-64">
            <div className="top-6 sticky bg-white p-6 border border-gray-200 rounded-lg max-h-[calc(100vh-2rem)] overflow-y-auto">
              <h2 className="mb-4 font-bold text-gray-900 text-lg uppercase">
                All Filters
              </h2>
              {/* Brand Filter */}
              <div className="mb-4">
                <button
                  onClick={() => toggleFilter("brand")}
                  className="flex justify-between items-center py-2 w-full font-semibold text-gray-900 hover:text-blue-600 text-left transition-colors"
                >
                  <span>
                    Brand
                    {appliedBrands.length > 0 && (
                      <span className="bg-blue-100 ml-2 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                        {appliedBrands.length}
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
                                  setSelectedBrands(brands.map((b) => b.id!))
                                }
                                className="text-blue-600 hover:text-blue-800 text-xs transition-colors"
                              >
                                Select All
                              </button>
                              <button
                                onClick={() => setSelectedBrands([])}
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
                                      checked={selectedBrands.includes(
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
                    Size
                    {appliedSizes.length > 0 && (
                      <span className="bg-blue-100 ml-2 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                        {appliedSizes.length}
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
                              selectedSizes.includes(size)
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
                    Colour
                    {appliedColors.length > 0 && (
                      <span className="bg-blue-100 ml-2 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                        {appliedColors.length}
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
                          const isSelected = selectedColors.includes(colorName);
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
                    Price
                    {(appliedMinPrice !== "" || appliedMaxPrice !== "") && (
                      <span className="bg-blue-100 ml-2 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                        {appliedMinPrice !== "" || appliedMaxPrice !== ""
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
                              Min Price (DA)
                            </label>
                            <input
                              type="number"
                              placeholder="0"
                              value={minPrice}
                              onChange={(e) =>
                                setMinPrice(
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
                              Max Price (DA)
                            </label>
                            <input
                              type="number"
                              placeholder="∞"
                              value={maxPrice}
                              onChange={(e) =>
                                setMaxPrice(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                                )
                              }
                              className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full text-sm"
                            />
                          </div>
                        </div>
                        {(minPrice !== "" || maxPrice !== "") && (
                          <button
                            onClick={() => {
                              setMinPrice("");
                              setMaxPrice("");
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
                    Delivery Type
                    {appliedDeliveryTypes.length > 0 && (
                      <span className="bg-blue-100 ml-2 px-2 py-0.5 rounded-full text-blue-800 text-xs">
                        {appliedDeliveryTypes.length}
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
                            checked={selectedDeliveryTypes.includes("free")}
                            onChange={() => toggleDeliveryFilter("free")}
                          />
                          <span className="text-gray-700 text-sm">
                            Free delivery
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="border-gray-300 rounded"
                            checked={selectedDeliveryTypes.includes("express")}
                            onChange={() => toggleDeliveryFilter("express")}
                          />
                          <span className="text-gray-700 text-sm">
                            Express delivery
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
                  Apply Filters
                  {hasPendingChanges && (
                    <span className="opacity-75 ml-2 text-xs">
                      (Changes pending)
                    </span>
                  )}
                </button>
                <button
                  onClick={clearAllFilters}
                  className="bg-gray-50 hover:bg-gray-100 px-4 py-2 border border-gray-300 hover:border-gray-400 rounded-lg w-full font-medium text-gray-700 hover:text-gray-900 text-sm transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </aside>
          {/* Products Grid */}
          <main className="flex-1">
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
                    {searchValue.get}"
                  </p>
                  <p className="mt-2 text-gray-500 text-sm">
                    <Translate content="Try adjusting your search terms" />
                  </p>
                </div>
                <Button
                  onClick={() => {
                    searchValue.set("");
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
                    <SearchProductCard product={product} />
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
// Collection Page Component
const CollectionPage = () => {
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
      <div className="bg-gray-50 py-3 border-gray-200 border-b">
        <div className="mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <a
              onClick={() => {
                history.push("/");
              }}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Home
            </a>
            <Icon
              icon={allIcons.solid.faChevronRight}
              iconClassName="text-xs"
            />
            <span className="font-medium text-gray-900">
              {selectedCollection?.name || <Translate content="Collection" />}
            </span>
          </div>
        </div>
      </div>
      {/* Collection Header */}
      <div className="mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="rounded-full w-24 h-24 overflow-hidden">
            <img
              src={selectedCollection?.photo}
              alt={selectedCollection?.name}
              className="w-full h-full object-cover"
            />
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
              Back to Home
            </Button>
          </div>
        ) : (
          /* Products Grid */
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {collectionProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <SearchProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
// Offer Page Component
const OfferPage = () => {
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
      <div className="bg-gray-50 py-3 border-gray-200 border-b">
        <div className="mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <a
              onClick={() => {
                history.push("/");
              }}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Home
            </a>
            <Icon
              icon={allIcons.solid.faChevronRight}
              iconClassName="text-xs"
            />
            <span className="font-medium text-gray-900">
              {selectedOffer?.name || <Translate content="Offer" />}
            </span>
          </div>
        </div>
      </div>
      {/* Offer Header */}
      <div className="mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-6 mb-8">
          <div
            className="flex justify-center items-center rounded-full w-24 h-24 font-bold text-white text-2xl"
            style={{
              background: "linear-gradient(to right, #89CFF0, #5DADE2)",
            }}
          >
            🔥
          </div>
          <div>
            <h1 className="mb-2 font-bold text-gray-900 text-4xl">
              {selectedOffer?.name}
            </h1>
            <div className="flex items-center gap-4 mb-2">
              <span className="font-bold text-3xl" style={{ color: "#89CFF0" }}>
                {selectedOffer?.price} DA
              </span>
              <Icon icon={icons.tag} iconClassName="text-2xl text-[#89CFF0]" />
            </div>
            <p className="text-gray-600 text-lg">
              <Translate content="Special offer including" />{" "}
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
              className="px-8 py-3 rounded font-semibold text-white"
              style={{ backgroundColor: "#89CFF0" }}
            >
              <Icon icon={allIcons.solid.faArrowLeft} iconClassName="mr-2" />
              Back to Home
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
                  <div className="relative">
                    <SearchProductCard product={product} />
                    {/* Offer Badge */}
                    <div className="top-2 right-2 absolute bg-red-500 px-2 py-1 rounded-full font-bold text-white text-xs">
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
          <div className="bg-gray-50 mt-12 p-6 rounded-lg">
            <h3 className="mb-4 font-bold text-gray-900 text-xl">
              Offer Summary
            </h3>
            <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
              <div className="text-center">
                <div
                  className="font-bold text-2xl"
                  style={{ color: "#89CFF0" }}
                >
                  {offerProducts.length}
                </div>
                <div className="text-gray-600 text-sm">Products Included</div>
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
                <div className="text-gray-600 text-sm">Total Items</div>
              </div>
              <div className="text-center">
                <div
                  className="font-bold text-2xl"
                  style={{ color: "#89CFF0" }}
                >
                  {selectedOffer?.price} DA
                </div>
                <div className="text-gray-600 text-sm">Special Price</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// Main Store Route Component with React Router
export const Test = () => {
  initCart();
  initFavorites();
  return (
    <div className="h-full overflow-y-auto">
      <Router>
        <div className="bg-gray-50 min-h-screen">
          <Switch>
            <Route exact path="/">
              <HomePage />
            </Route>
            <Route path="/search">
              <SearchPage />
            </Route>
            <Route path="/collection/:collectionId">
              <CollectionPage />
            </Route>
            <Route path="/offer/:offerId">
              <OfferPage />
            </Route>
            <Route path="/cart">
              <CustomCartView />
            </Route>
            <Route path="/favorites">
              <FavoritesPage />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
};
