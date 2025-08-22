import photo1 from "../assets/1.png";
import photo2 from "../assets/2.png";
import { allIcons } from "@biqpod/app/ui/apis";
import {
  Translate,
  IconProps,
  Icon,
  JoinComponentBy,
} from "@biqpod/app/ui/components";
import {
  useAsyncMemo,
  useCopyState,
  useSettingValue,
} from "@biqpod/app/ui/hooks";
import { tw } from "@biqpod/app/ui/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useMemo, useEffect } from "react";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useFavoritesCount, useCartCounts } from "../hooks";
import { CollectionProducts } from "./CollectionProducts";
import { Button } from "./Custom";
import { ProductCard } from "./ProductCard";
import {
  icons,
  BRAND_COLOR_SECONDARY,
  COLOR_PALETTE,
  BRAND_COLOR_PRIMARY,
  BRAND_COLOR_ACCENT,
} from "./utils";
import { setSettingValue } from "@biqpod/app/ui/hooks";
export const langSettingId = "window/lang.enum";
const platformIcons: Record<string, IconProps["icon"]> = {
  facebook: allIcons.brands.faFacebook,
  instagram: allIcons.brands.faInstagram,
  x: allIcons.brands.faTwitter,
  youtube: allIcons.brands.faYoutube,
  tiktok: allIcons.brands.faTiktok,
  pinterest: allIcons.brands.faPinterest,
  linkedin: allIcons.brands.faLinkedin,
  snapchat: allIcons.brands.faSnapchatGhost,
};
export const HomePage = () => {
  const langSetting = useSettingValue(langSettingId);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const history = useHistory();
  const favoritesCount = useFavoritesCount();
  const cartCount = useCartCounts();
  // Search placeholder cycling with typing animation
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  // Initialize cart and favorites
  // Scroll to top functionality
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  // Track scroll position for scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollTop = scrollContainerRef.current.scrollTop;
        // Only show button when scrolled down more than 100px in the container
        setShowScrollToTop(scrollTop > 100);
      }
    };
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      handleScroll(); // Call once on mount to check initial position
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (
        showLangMenu &&
        langMenuRef.current &&
        target &&
        !langMenuRef.current.contains(target)
      ) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showLangMenu]);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (showMobileMenu && !target.closest("header")) {
        setShowMobileMenu(false);
      }
    };
    if (showMobileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMobileMenu]);
  // Scroll to top function
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };
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
      photo1,
      photo2,
      // Using more reliable image sources
      "https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
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
  // Images for the commerce sign-in section
  const commerceImages = useMemo(() => {
    return [
      "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3184469/pexels-photo-3184469.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3184463/pexels-photo-3184463.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3182749/pexels-photo-3182749.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=800",
    ];
  }, []);
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
  // Trending searches: random mix of product and brand names
  const trendingTerms = useMemo(() => {
    const terms: string[] = [];
    if (brands && brands.length > 0) {
      brands.forEach((b) => {
        if (b.name) terms.push(b.name);
      });
    }
    if (products && products.length > 0) {
      products.forEach((p) => {
        if (p.name) terms.push(p.name);
      });
    }
    // Deduplicate
    const deduped = Array.from(new Set(terms));
    // Shuffle
    for (let i = deduped.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deduped[i], deduped[j]] = [deduped[j], deduped[i]];
    }
    // Take up to 10 entries, fallback to defaults if empty
    const picked = deduped.slice(0, 10);
    if (picked.length > 0) return picked;
    return ["Products", "Brands", "Collections", "Offers"]; // fallback
  }, [brands, products]);
  return (
    <div
      ref={scrollContainerRef}
      className="relative bg-gray-50 h-[100vh] overflow-y-auto"
    >
      {/* Offers Banner - Show if there are offers */}
      {offers && offers.length > 0 && (
        <div
          className="py-3"
          style={{
            background: COLOR_PALETTE.gradients.primary,
          }}
        >
          <div className="mx-auto px-4 max-w-7xl">
            <div className="flex justify-center items-center gap-4 text-white">
              <span className="text-2xl animate-bounce">🔥</span>
              <span
                className="font-bold text-lg uppercase"
                style={{ fontFamily: "Oswald, sans-serif" }}
              >
                <Translate content="special offers available" /> -{" "}
                {offers.length} <Translate content="packs on sale!" />
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

            {/* Desktop Navigation */}
            <nav
              className="max-md:hidden md:flex items-center gap-2"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {/* Search Button */}
              <button
                onClick={() => {
                  setShowSearch((s) => !s);
                }}
                className="flex justify-center items-center hover:bg-gray-100 rounded-full w-[40px] h-[40px] text-gray-700 hover:text-gray-900 transition-colors"
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
                  <span
                    className="top-0 right-0 absolute flex justify-center items-center rounded-full w-5 h-5 font-bold text-white text-xs"
                    style={{ backgroundColor: BRAND_COLOR_PRIMARY }}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowLangMenu((prev) => !prev)}
                className="relative flex justify-center items-center hover:bg-gray-100 rounded-full w-[40px] h-[40px] text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Icon
                  icon={allIcons.solid.faEarthEurope}
                  iconClassName="text-xl"
                />
                <AnimatePresence>
                  {showLangMenu && (
                    <motion.div
                      ref={langMenuRef}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className={tw(
                        "top-12 z-50 absolute bg-white shadow-lg py-2 border border-gray-200 rounded-lg w-36",
                        langSetting === "ar" ? "left-0" : "right-0"
                      )}
                    >
                      {[
                        { id: "ar", name: "🇸🇦 العربية" },
                        { id: "fr", name: "🇫🇷 Français" },
                        { id: "en", name: "🇬🇧 English" },
                      ].map(({ id, name }) => (
                        <button
                          key={id}
                          className={tw(
                            "block w-full px-3 py-2 hover:bg-gray-100 text-sm",
                            langSetting === "ar" ? "text-right" : "text-left",
                            langSetting === id
                              ? "font-semibold text-sky-500"
                              : "text-gray-700"
                          )}
                          onClick={() => {
                            setSettingValue(langSettingId, id);
                            setShowLangMenu(false);
                          }}
                        >
                          {name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu((prev) => !prev)}
              className="md:hidden flex justify-center items-center hover:bg-gray-100 rounded-full w-[40px] h-[40px] text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Icon
                icon={
                  showMobileMenu
                    ? allIcons.solid.faXmark
                    : allIcons.solid.faBars
                }
                iconClassName="text-xl"
              />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="md:hidden bg-white shadow-lg border-gray-200 border-t"
            >
              <div className="mx-auto px-4 py-4 max-w-7xl">
                <div className="space-y-4">
                  {/* Search */}
                  <button
                    onClick={() => {
                      setShowSearch((s) => !s);
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-lg w-full text-gray-700 hover:text-gray-900 text-left transition-colors"
                  >
                    <Icon icon={icons.search} iconClassName="text-lg" />
                    <span className="font-medium">
                      <Translate content="Search" />
                    </span>
                  </button>

                  {/* Favorites */}
                  <button
                    onClick={() => {
                      history.push("/favorites");
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-lg w-full text-gray-700 hover:text-gray-900 text-left transition-colors"
                  >
                    <div className="relative">
                      <Icon
                        icon={
                          favoritesCount > 0
                            ? allIcons.solid.faHeart
                            : allIcons.regular.faHeart
                        }
                        iconClassName={tw(
                          "text-lg",
                          favoritesCount > 0 ? "text-red-500" : ""
                        )}
                      />
                      {favoritesCount > 0 && (
                        <span className="top-0 -right-2 absolute flex justify-center items-center bg-red-500 rounded-full w-4 h-4 font-bold text-white text-xs">
                          {favoritesCount > 99 ? "99+" : favoritesCount}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">
                      <Translate content="Favorites" />
                    </span>
                  </button>

                  {/* Cart */}
                  <button
                    onClick={() => {
                      history.push("/cart");
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-lg w-full text-gray-700 hover:text-gray-900 text-left transition-colors"
                  >
                    <div className="relative">
                      <Icon icon={icons.shoppingCart} iconClassName="text-lg" />
                      {cartCount > 0 && (
                        <span
                          className="top-0 -right-2 absolute flex justify-center items-center rounded-full w-4 h-4 font-bold text-white text-xs"
                          style={{ backgroundColor: BRAND_COLOR_PRIMARY }}
                        >
                          {cartCount > 99 ? "99+" : cartCount}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">
                      <Translate content="Cart" />
                    </span>
                  </button>

                  {/* Language Selector */}
                  <div className="pt-4 border-gray-200 border-t">
                    <div className="mb-2 font-medium text-gray-900 text-sm">
                      <Translate content="Language" />
                    </div>
                    <div className="space-y-2">
                      {[
                        { id: "ar", name: "🇸🇦 العربية" },
                        { id: "fr", name: "🇫🇷 Français" },
                        { id: "en", name: "🇬🇧 English" },
                      ].map(({ id, name }) => (
                        <button
                          key={id}
                          className={tw(
                            "block w-full px-3 py-2 hover:bg-gray-50 rounded-lg text-left transition-colors",
                            langSetting === id
                              ? "bg-blue-50 font-semibold text-blue-600"
                              : "text-gray-700"
                          )}
                          onClick={() => {
                            setSettingValue(langSettingId, id);
                            setShowMobileMenu(false);
                          }}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                    onFocus={(e) => {
                      e.target.style.borderColor = BRAND_COLOR_PRIMARY;
                    }}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                    autoFocus
                  />
                  <button
                    className="top-1/2 right-3 absolute text-gray-400 hover:text-gray-600 -translate-y-1/2 transform"
                    onClick={() => {
                      history.push(
                        "/search?q=" + encodeURIComponent(searchValue.get)
                      );
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
                  {trendingTerms.map((term, index) => (
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
                        history.push("/search?q=" + encodeURIComponent(term));
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
              <span style={{ color: BRAND_COLOR_ACCENT }}>
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
                backgroundColor: BRAND_COLOR_PRIMARY,
              }}
              onClick={() => history.push("/search?q=")}
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
              background: COLOR_PALETTE.gradients.accent,
            }}
          >
            <div className="flex justify-center items-center bg-white/90 shadow-2xl rounded-full w-80 h-80">
              <div style={{ color: BRAND_COLOR_PRIMARY }}>
                <Icon icon={icons.user} iconClassName="text-6xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Brands Section */}
      <div className="bg-white py-16">
        <div className="mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2
              className="mb-4 font-bold text-gray-900 text-3xl md:text-4xl uppercase"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              <Translate content="brands to" />{" "}
              <span className="bg-gradient-to-r from-blue-200 to-blue-300 px-2 py-1 rounded italic">
                <Translate content="Four R" />
              </span>
            </h2>
            <p
              className="mx-auto max-w-2xl text-gray-600 text-lg"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Translate content="Discover premium brands that define quality and style" />
            </p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-4 mx-auto max-w-5xl">
            {brands
              ?.filter((brand) => brand.photo)
              .slice(0, 12)
              .map((brand, index) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -5,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`group flex-shrink-0 px-6 py-4 rounded-full transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg ${
                    index % 6 === 0
                      ? "bg-gradient-to-r from-pink-200 to-pink-300 hover:from-pink-300 hover:to-pink-400"
                      : index % 6 === 1
                      ? "bg-gradient-to-r from-blue-200 to-blue-300 hover:from-blue-300 hover:to-blue-400"
                      : index % 6 === 2
                      ? "bg-gradient-to-r from-purple-200 to-purple-300 hover:from-purple-300 hover:to-purple-400"
                      : index % 6 === 3
                      ? "bg-gradient-to-r from-green-200 to-green-300 hover:from-green-300 hover:to-green-400"
                      : index % 6 === 4
                      ? "bg-gradient-to-r from-yellow-200 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400"
                      : "bg-gradient-to-r from-orange-200 to-orange-300 hover:from-orange-300 hover:to-orange-400"
                  }`}
                  onClick={() => {
                    if (brand.id) {
                      history.push(`/brand/${brand.id}`);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    {brand.photo && (
                      <motion.img
                        src={brand.photo}
                        alt={brand.name}
                        className="h-10 object-contain group-hover:scale-110 transition-transform duration-300"
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </div>
      {/* Collections Section */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2
              className="mb-4 font-bold text-gray-900 text-3xl md:text-4xl capitalize"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              <Translate content="shop by" />{" "}
              <span className="bg-gradient-to-r from-blue-200 to-blue-300 px-2 py-1 rounded italic">
                <Translate content="collections" />
              </span>
            </h2>
            <p
              className="mx-auto max-w-2xl text-gray-600 text-lg"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Translate content="Explore our carefully curated collections designed for every style and occasion" />
            </p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-8 mx-auto max-w-6xl">
            {collections?.map((collection, index) => {
              return (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.15,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    scale: 1.1,
                    y: -10,
                    transition: { duration: 0.3 },
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group flex flex-col gap-3 w-32 text-center cursor-pointer"
                  onClick={() => {
                    history.push(`/collection/${collection.id}`);
                  }}
                >
                  <motion.div
                    className="shadow-lg group-hover:shadow-2xl mx-auto border-4 border-transparent group-hover:border-blue-200 rounded-full w-24 h-24 overflow-hidden transition-all duration-500"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <img
                      src={collection.photo}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500"
                    />
                  </motion.div>
                  <motion.h3
                    className="font-semibold text-gray-800 group-hover:text-blue-600 text-sm transition-colors duration-300"
                    style={{ fontFamily: "Inter, sans-serif" }}
                    initial={{ opacity: 0.8 }}
                    whileHover={{
                      opacity: 1,
                      scale: 1.05,
                      transition: { duration: 0.2 },
                    }}
                  >
                    {collection.name}
                  </motion.h3>
                  <motion.div
                    className="mx-auto w-0 group-hover:w-16 h-0.5 transition-all duration-300"
                    style={{
                      background: `linear-gradient(to right, ${BRAND_COLOR_SECONDARY}, #4338ca)`,
                    }}
                    initial={{ width: 0 }}
                    whileHover={{ width: "4rem" }}
                  />
                </motion.div>
              );
            })}
          </div>
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
                      background: COLOR_PALETTE.gradients.primary,
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
                        background: COLOR_PALETTE.gradients.primary,
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
      {/* Become a Merchant Section */}
      <div className="bg-white py-16">
        <div className="mx-auto px-4 max-w-7xl">
          <div className="mb-8 text-center">
            <h2
              className="mb-3 font-bold text-gray-900 text-3xl md:text-4xl"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              <Translate content="Sign in as a Commerce" />
            </h2>
            <p
              className="mx-auto max-w-2xl text-gray-600 text-lg"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Translate content="Do you sell products? Join our marketplace and reach more customers." />
            </p>
          </div>
          <div className="gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8">
            {commerceImages.map((src, idx) => (
              <div
                key={idx}
                className="group relative shadow rounded-lg overflow-hidden"
              >
                <img
                  src={src}
                  alt={`Commerce inspiration ${idx + 1}`}
                  className="w-full h-32 md:h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Commerce";
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Button
              className="px-8 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: BRAND_COLOR_PRIMARY }}
              onClick={() => history.push("/client-signin")}
            >
              <Translate content="Apply as Merchant" />
            </Button>
          </div>
        </div>
      </div>
      {/* Why Choose Us Section */}
      <div className="bg-white py-16">
        <div className="mx-auto px-4 max-w-7xl">
          <div className="mb-12 text-center">
            <h2
              className="mb-4 font-bold text-gray-900 text-3xl md:text-4xl"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              <Translate content="Why Choose Our Store?" />
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
              <div
                className="flex justify-center items-center mx-auto mb-4 rounded-full w-16 h-16 transition-colors duration-300"
                style={{
                  backgroundColor: COLOR_PALETTE.primary.light,
                }}
              >
                <span style={{ color: BRAND_COLOR_PRIMARY }}>
                  <Icon
                    icon={allIcons.solid.faShippingFast}
                    iconClassName="text-2xl"
                  />
                </span>
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
              <div
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = "tel:" + store?.phone; // Replace with actual support number
                  a.click();
                }}
                className="flex justify-center items-center bg-purple-100 group-hover:bg-purple-200 mx-auto mb-4 rounded-full w-16 h-16 transition-colors duration-300 cursor-pointer"
              >
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
      {/* Watch Collection Section */}
      <div className="bg-white py-16">
        <div className="mx-auto px-4 max-w-7xl">
          <div className="mb-12 text-center">
            <h2
              className="mb-4 font-bold text-gray-900 text-3xl md:text-4xl"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              <Translate content="Luxury Watch Collection" />
            </h2>
            <p
              className="mx-auto max-w-2xl text-gray-600 text-lg"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Translate content="Discover our premium collection of timepieces that blend elegance with precision" />
            </p>
          </div>
          <div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Watch Photo 1 - Person with watch */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="group relative rounded-lg overflow-hidden"
            >
              <img
                src="https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Elegant watch on wrist"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/600x400/e5e7eb/6b7280?text=Watch+Collection";
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300">
                <div className="bottom-4 left-4 absolute text-white">
                  <h3
                    className="mb-2 font-bold text-xl"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    <Translate content="Classic Elegance" />
                  </h3>
                  <p className="opacity-90 text-sm">
                    <Translate content="Timeless design for every occasion" />
                  </p>
                </div>
              </div>
            </motion.div>
            {/* Watch Photo 2 - Someone looking at watch */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative rounded-lg overflow-hidden"
            >
              <img
                src="https://images.pexels.com/photos/2113994/pexels-photo-2113994.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Person checking time on luxury watch"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/600x400/e5e7eb/6b7280?text=Watch+Timing";
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300">
                <div className="bottom-4 left-4 absolute text-white">
                  <h3
                    className="mb-2 font-bold text-xl"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    <Translate content="Perfect Timing" />
                  </h3>
                  <p className="opacity-90 text-sm">
                    <Translate content="Precision meets style" />
                  </p>
                </div>
              </div>
            </motion.div>
            {/* Watch Photo 3 - Amazing motion/detail */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative rounded-lg overflow-hidden"
            >
              <img
                src="https://images.pexels.com/photos/125779/pexels-photo-125779.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Luxury watch with amazing details"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/600x400/e5e7eb/6b7280?text=Watch+Masterpiece";
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300">
                <div className="bottom-4 left-4 absolute text-white">
                  <h3
                    className="mb-2 font-bold text-xl"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    <Translate content="Masterpiece" />
                  </h3>
                  <p className="opacity-90 text-sm">
                    <Translate content="Crafted to perfection" />
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      {/* Watch Lifestyle Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-16">
        <div className="mx-auto px-4 max-w-7xl">
          <div className="items-center gap-12 grid grid-cols-1 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2
                className="mb-6 font-bold text-white text-3xl md:text-4xl"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                <Translate content="More Than Just Time" />
              </h2>
              <p
                className="mb-8 text-gray-300 text-lg leading-relaxed"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <Translate content="A luxury watch is not just an instrument for measuring time, but a statement of style, sophistication, and personal achievement. Each timepiece tells a story of craftsmanship and dedication." />
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex justify-center items-center bg-blue-500 rounded-full w-8 h-8">
                    <Icon
                      icon={allIcons.solid.faCheck}
                      iconClassName="text-white text-sm"
                    />
                  </div>
                  <span className="text-gray-300">
                    <Translate content="Premium Swiss Movement" />
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex justify-center items-center bg-blue-500 rounded-full w-8 h-8">
                    <Icon
                      icon={allIcons.solid.faCheck}
                      iconClassName="text-white text-sm"
                    />
                  </div>
                  <span className="text-gray-300">
                    <Translate content="Sapphire Crystal Glass" />
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex justify-center items-center bg-blue-500 rounded-full w-8 h-8">
                    <Icon
                      icon={allIcons.solid.faCheck}
                      iconClassName="text-white text-sm"
                    />
                  </div>
                  <span className="text-gray-300">
                    <Translate content="Water Resistant to 100m" />
                  </span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://images.pexels.com/photos/2113994/pexels-photo-2113994.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Person wearing luxury watch"
                className="shadow-2xl rounded-lg w-full h-96 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/800x600/e5e7eb/6b7280?text=Luxury+Watch+Lifestyle";
                }}
              />
              <div className="top-4 right-4 absolute bg-white bg-opacity-90 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon
                    icon={allIcons.solid.faClock}
                    iconClassName="text-blue-500"
                  />
                  <span className="font-semibold text-gray-900 text-sm">
                    <Translate content="Swiss Made" />
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      {/* Watch Gallery Section */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto px-4 max-w-7xl">
          <div className="mb-12 text-center">
            <h2
              className="mb-4 font-bold text-gray-900 text-3xl md:text-4xl"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              <Translate content="Timepiece Gallery" />
            </h2>
            <p
              className="mx-auto max-w-2xl text-gray-600 text-lg"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Translate content="Explore our curated selection of exceptional timepieces from around the world" />
            </p>
          </div>
          <div className="gap-6 grid grid-cols-2 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="group relative shadow-lg rounded-lg overflow-hidden"
            >
              <img
                src="https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Classic watch collection"
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Classic+Series";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bottom-4 left-4 absolute text-white">
                  <p className="font-semibold text-sm">
                    <Translate content="Classic Series" />
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative shadow-lg rounded-lg overflow-hidden"
            >
              <img
                src="https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Sports watch on wrist"
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Sport+Collection";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bottom-4 left-4 absolute text-white">
                  <p className="font-semibold text-sm">
                    <Translate content="Sport Collection" />
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative shadow-lg rounded-lg overflow-hidden"
            >
              <img
                src="https://images.pexels.com/photos/2113994/pexels-photo-2113994.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Luxury timepiece detail"
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Luxury+Series";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bottom-4 left-4 absolute text-white">
                  <p className="font-semibold text-sm">
                    <Translate content="Luxury Series" />
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group relative shadow-lg rounded-lg overflow-hidden"
            >
              <img
                src="https://images.pexels.com/photos/125779/pexels-photo-125779.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Watch mechanism close-up"
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Mechanical";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bottom-4 left-4 absolute text-white">
                  <p className="font-semibold text-sm">
                    <Translate content="Mechanical" />
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
          {/* Additional Row */}
          <div className="gap-6 grid grid-cols-1 md:grid-cols-3 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="group relative shadow-lg rounded-lg overflow-hidden"
            >
              <img
                src="https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Person checking premium watch"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/600x400/e5e7eb/6b7280?text=Executive+Choice";
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300">
                <div className="bottom-6 left-6 absolute text-white">
                  <h3 className="mb-2 font-bold text-xl">
                    <Translate content="Executive Choice" />
                  </h3>
                  <p className="opacity-90 text-sm">
                    <Translate content="Perfect for business professionals" />
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="group relative shadow-lg rounded-lg overflow-hidden"
            >
              <img
                src="https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Vintage watch with amazing motion"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/600x400/e5e7eb/6b7280?text=Vintage+Heritage";
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300">
                <div className="bottom-6 left-6 absolute text-white">
                  <h3 className="mb-2 font-bold text-xl">
                    <Translate content="Vintage Heritage" />
                  </h3>
                  <p className="opacity-90 text-sm">
                    <Translate content="Timeless classics with history" />
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="group relative shadow-lg rounded-lg overflow-hidden"
            >
              <img
                src="https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Modern watch lifestyle"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/600x400/e5e7eb/6b7280?text=Modern+Innovation";
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300">
                <div className="bottom-6 left-6 absolute text-white">
                  <h3 className="mb-2 font-bold text-xl">
                    <Translate content="Modern Innovation" />
                  </h3>
                  <p className="opacity-90 text-sm">
                    <Translate content="Cutting-edge technology meets style" />
                  </p>
                </div>
              </div>
            </motion.div>
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
          <div className="flex justify-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full text-white text-center"
            >
              <div className="mb-2 font-bold text-4xl">{products?.length}</div>
              <div className="text-blue-100">
                <Translate content="Products" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full text-white text-center"
            >
              <div className="mb-2 font-bold text-4xl">{brands?.length}</div>
              <div className="text-blue-100">
                <Translate content="Brands" />
              </div>
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
                  className="flex-1 px-4 py-3 border border-gray-300 focus:border-transparent border-solid rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-80"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
                <Button
                  className="px-6 py-3 rounded-lg font-semibold text-white whitespace-nowrap"
                  style={{ backgroundColor: BRAND_COLOR_PRIMARY }}
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
                        href="mailto:support@ourstore.com"
                        className="text-gray-300 hover:text-blue-400 transition-colors"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        support@ourstore.com
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
              <div className="flex md:flex-row flex-col items-center gap-6">
                <span
                  className="font-semibold text-gray-900 text-sm uppercase tracking-wide"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <Translate content="We Accept" />
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex justify-center items-center bg-white px-3 py-2 border border-gray-200 rounded w-12 h-8">
                    <span style={{ color: BRAND_COLOR_SECONDARY }}>
                      <Icon
                        icon={allIcons.brands.faCcVisa}
                        iconClassName="text-lg"
                      />
                    </span>
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
                  <div className="flex justify-center items-center bg-white px-3 py-2 border border-gray-200 rounded w-12 h-8">
                    <Icon
                      icon={allIcons.brands.faGooglePay}
                      iconClassName="text-blue-500 text-lg"
                    />
                  </div>
                  <div className="flex justify-center items-center bg-white px-2 py-2 border border-gray-200 rounded w-16 h-8">
                    <div className="flex items-center gap-1">
                      <Icon
                        icon={allIcons.solid.faCreditCard}
                        iconClassName="text-green-600 text-xs"
                      />
                      <span
                        className="font-bold text-green-600 text-xs"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        EDAH
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center items-center bg-white px-2 py-2 border border-gray-200 rounded w-12 h-8">
                    <div className="flex items-center gap-1">
                      <Icon
                        icon={allIcons.solid.faUniversity}
                        iconClassName="text-blue-700 text-xs"
                      />
                      <span
                        className="font-bold text-blue-700 text-xs"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        CIB
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-600 text-sm">
                <Link
                  to="/privacy-policy"
                  className="hover:text-gray-900 transition-colors"
                >
                  <Translate content="Privacy Policy" />
                </Link>
                <span>•</span>
                <Link
                  to="/terms-of-service"
                  className="hover:text-gray-900 transition-colors"
                >
                  <Translate content="Terms of Service" />
                </Link>
                <span>•</span>
                <Link
                  to="/cookie-policy"
                  className="hover:text-gray-900 transition-colors"
                >
                  <Translate content="Cookie Policy" />
                </Link>
              </div>
              <div className="flex items-center gap-4 text-gray-600 text-sm">
                <JoinComponentBy
                  joinComponent={<span>•</span>}
                  list={[
                    { id: "fr", name: "French" },
                    { id: "en", name: "English" },
                    { id: "ar", name: "Arabic" },
                  ].map(({ id, name }) => {
                    return (
                      <span
                        className={tw(
                          "hover:text-gray-900 transition-colors cursor-pointer",
                          langSetting === id && "underline"
                        )}
                        key={id}
                        onClick={() => {
                          setSettingValue(langSettingId, id);
                        }}
                      >
                        {name}
                      </span>
                    );
                  })}
                />
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
      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            className="right-6 bottom-6 z-[9999] fixed flex justify-center items-center shadow-2xl border-2 border-white rounded-full w-16 h-16 text-white hover:scale-110 transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${BRAND_COLOR_SECONDARY} 0%, #4338ca 100%)`,
              backdropFilter: "blur(10px)",
              boxShadow: `0 10px 30px ${BRAND_COLOR_SECONDARY}50`,
            }}
            aria-label="Scroll to top"
          >
            <Icon icon={allIcons.solid.faChevronUp} iconClassName="text-2xl" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
