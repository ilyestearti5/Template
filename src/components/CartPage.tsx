import { allIcons } from "@biqpod/app/ui/apis";
import {
  AsyncComponent,
  EmptyComponent,
  Icon,
  Translate,
} from "@biqpod/app/ui/components";
import { useAsyncMemo, showToast } from "@biqpod/app/ui/hooks";
import { mapAsync } from "@biqpod/app/ui/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useHistory } from "react-router";
import { api, initPixels, useStore } from "../api";
import {
  useFullCartItems,
  deleteCart,
  removeCart,
  removePackFromCart,
  addToCart,
  addPackToCart,
  useIsSignedIn,
} from "../hooks";
import { Button } from "./Custom";
import {
  getProductPrice,
  getProductPricesForCustomer,
  icons,
  COMMON_STYLES,
  BRAND_COLOR,
  BRAND_COLOR_PRIMARY,
  COLOR_PALETTE,
} from "./utils";
import { Breadcrumb } from "./Breadcrumb";
import { ProductCard } from "./ProductCard";
import { CheckoutInformation } from "./CheckoutInformation";
export const CustomCartView = () => {
  const cartItems = useFullCartItems(); // This now includes both products and packs
  const history = useHistory();
  const isSignedIn = useIsSignedIn(); // Check if customer is signed in
  // Checkout popup state
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<string>("express");
  // Clear cart dialog state
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);
  const deliveryOptions = [
    {
      id: "express",
      name: "Express Delivery",
      duration: "1-2 days",
      price: 500,
      icon: allIcons.solid.faShippingFast,
    },
    {
      id: "standard",
      name: "Standard Delivery",
      duration: "3-5 days",
      price: 200,
      icon: allIcons.solid.faTruck,
    },
    {
      id: "store",
      name: "Store Pickup",
      duration: "Available today",
      price: 0,
      icon: allIcons.solid.faStore,
    },
  ];
  const store = useStore();
  const pixels = initPixels(store);
  const handleQuantityChange = async (
    itemId: string,
    newCount: number,
    itemType: "product" | "pack"
  ) => {
    if (newCount <= 0) {
      if (itemType === "product") {
        removeCart(itemId);
      } else {
        removePackFromCart(itemId);
      }
    } else {
      if (itemType === "product") {
        addToCart(itemId, newCount);
        const product = await api.getProduct(itemId);
        if (product) {
          await pixels?.addToCart(product, newCount);
        }
      } else {
        // Find the pack data to re-add with new count
        const packItem = cartItems.find(
          (item) =>
            item.type === "pack" && "packId" in item && item.packId === itemId
        );
        if (packItem && "packData" in packItem) {
          addPackToCart(packItem.packData, newCount);
        }
      }
    }
  };
  const handleMinusClick = (
    itemId: string,
    currentCount: number,
    itemName: string,
    itemType: "product" | "pack"
  ) => {
    if (currentCount === 1) {
      // Show confirmation dialog when removing the last item
      setProductToDelete({ prodId: itemId, productName: itemName, itemType });
      setShowDeleteConfirmation(true);
    } else {
      // Decrease quantity normally
      handleQuantityChange(itemId, currentCount - 1, itemType);
    }
  };
  const confirmDeleteProduct = () => {
    if (productToDelete) {
      if (productToDelete.itemType === "product") {
        removeCart(productToDelete.prodId);
      } else {
        removePackFromCart(productToDelete.prodId);
      }
      setShowDeleteConfirmation(false);
      setProductToDelete(null);
    }
  };
  const handleRemoveItem = (itemId: string, itemType: "product" | "pack") => {
    if (itemType === "product") {
      removeCart(itemId);
    } else {
      removePackFromCart(itemId);
    }
  };
  // Confirmation dialog state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    prodId: string;
    productName: string;
    itemType: "product" | "pack";
  } | null>(null);
  const cancelDeleteProduct = () => {
    setShowDeleteConfirmation(false);
    setProductToDelete(null);
  };
  // Clear cart dialog functions
  const handleClearCartClick = () => {
    setShowClearCartDialog(true);
  };
  const confirmClearCart = () => {
    deleteCart();
    showToast("Cart cleared", "info");
    setShowClearCartDialog(false);
  };
  const cancelClearCart = () => {
    setShowClearCartDialog(false);
  };
  const totalPrice = useAsyncMemo(async () => {
    const result = await mapAsync(cartItems, async (item) => {
      if (item.type === "product") {
        const product = await api.getProduct(item.prodId);
        if (!product) return 0;
        // Use customer pricing if signed in, otherwise use regular pricing
        if (isSignedIn) {
          const prices = getProductPricesForCustomer(product);
          return prices.customerPrice * item.count;
        } else {
          return getProductPrice(product) * item.count;
        }
      } else if (item.type === "pack") {
        return (item.packData.price || 0) * item.count;
      }
      return 0;
    });
    return result.reduce((acc, curr) => acc + curr, 0);
  }, [cartItems, isSignedIn]);
  // Calculate savings when signed in
  const totalSavings = useAsyncMemo(async () => {
    if (!isSignedIn) return 0;
    const result = await mapAsync(cartItems, async (item) => {
      if (item.type === "product") {
        const product = await api.getProduct(item.prodId);
        if (!product) return 0;
        const prices = getProductPricesForCustomer(product);
        return prices.discountAmount * item.count;
      }
      return 0;
    });
    return result.reduce((acc, curr) => acc + curr, 0);
  }, [cartItems, isSignedIn]);
  const deliveryFee = useMemo(() => {
    const option = deliveryOptions.find((o) => o.id === selectedDelivery);
    if (!option?.price) return 0;
    return option.price;
  }, [selectedDelivery, deliveryOptions]);
  // Check for different empty states
  const hasProducts =
    cartItems?.some((item) => item.type === "product") || false;
  const hasPacks = cartItems?.some((item) => item.type === "pack") || false;
  const isEmpty = !cartItems || cartItems.length === 0;
  // Handle completely empty cart
  if (isEmpty) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="mx-auto px-4 py-16 max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center items-center gap-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
            >
              <Icon
                icon={icons.shoppingCart}
                iconClassName="text-6xl text-gray-400"
              />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="font-bold text-gray-900 text-2xl"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              <Translate content="your cart is empty" />
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-gray-600"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Translate content="add some products or packs to get started" />
            </motion.p>
            {/* Empty cart features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="gap-6 grid grid-cols-1 md:grid-cols-3 mt-8 max-w-4xl"
            >
              <div className="bg-white shadow-sm p-6 rounded-lg text-center">
                <Icon
                  icon={allIcons.solid.faBox}
                  iconClassName="text-3xl text-blue-500 mb-3"
                />
                <h3 className="mb-2 font-semibold text-gray-900">
                  <Translate content="product packs" />
                </h3>
                <p className="text-gray-600 text-sm">
                  <Translate content="save money with our curated product bundles" />
                </p>
              </div>
              <div className="bg-white shadow-sm p-6 rounded-lg text-center">
                <Icon
                  icon={allIcons.solid.faTruck}
                  iconClassName="text-3xl text-green-500 mb-3"
                />
                <h3 className="mb-2 font-semibold text-gray-900">
                  <Translate content="fast delivery" />
                </h3>
                <p className="text-gray-600 text-sm">
                  <Translate content="express delivery available on all orders" />
                </p>
              </div>
              <div className="bg-white shadow-sm p-6 rounded-lg text-center">
                <Icon
                  icon={allIcons.solid.faPercent}
                  iconClassName="text-3xl text-red-500 mb-3"
                />
                <h3 className="mb-2 font-semibold text-gray-900">
                  <Translate content="special offers" />
                </h3>
                <p className="text-gray-600 text-sm">
                  <Translate content="exclusive discounts for our customers" />
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                className="shadow-lg hover:shadow-xl px-8 py-4 border-2 rounded-lg font-semibold text-white text-lg transition-all duration-200"
                style={{
                  backgroundColor: BRAND_COLOR,
                  borderColor: BRAND_COLOR,
                  fontFamily: "Inter, sans-serif",
                }}
                onClick={() => history.push("/")}
              >
                <Icon
                  icon={allIcons.solid.faShoppingBag}
                  iconClassName="mr-2"
                />
                <Translate content="start shopping" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb always at the top */}
      <Breadcrumb
        items={[
          {
            label: "Cart",
            isTranslatable: true,
          },
        ]}
        className="!bg-transparent !border-none"
      />
      <div className="mx-auto px-6 py-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-6 pb-4 border-gray-200 border-b"
        >
          <div className="flex items-center gap-4">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-bold text-gray-900 text-2xl"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Translate content="cart" /> ({cartItems?.length || 0}{" "}
              <Translate content="item" />)
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Button
                className="px-4 py-2 border-2 rounded-md font-medium text-gray-600 hover:text-gray-800 hover:scale-105 transition-all duration-200"
                style={{
                  fontFamily: "Inter, sans-serif",
                  borderColor: "#e5e7eb",
                  backgroundColor: "white",
                }}
                onClick={() => history.push("/")}
              >
                <Translate content="continue shopping" />
              </Button>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              className="shadow-lg hover:shadow-xl px-6 py-2 rounded-md font-medium text-white transition-all duration-200"
              style={{
                fontFamily: "Inter, sans-serif",
                backgroundColor: BRAND_COLOR,
                borderColor: BRAND_COLOR,
              }}
              onClick={() => setShowCheckoutPopup(true)}
            >
              <Translate content="checkout" />
            </Button>
          </motion.div>
        </motion.div>
        {/* Cart Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 p-4 border rounded-lg"
          style={{
            backgroundColor: `${COLOR_PALETTE.primary.light}15`, // Light background with transparency
            borderColor: COLOR_PALETTE.primary.light,
          }}
        >
          <div className="gap-4 grid grid-cols-2 md:grid-cols-4">
            <div className="text-center">
              <div
                className="font-bold text-2xl"
                style={{ color: BRAND_COLOR }}
              >
                {cartItems?.length || 0}
              </div>
              <div className="text-gray-600 text-sm">
                <Translate content="items" />
              </div>
            </div>
            <div className="text-center">
              <div
                className="font-bold text-2xl"
                style={{ color: BRAND_COLOR }}
              >
                {cartItems?.reduce((sum, item) => sum + item.count, 0) || 0}
              </div>
              <div className="text-gray-600 text-sm">
                <Translate content="quantity" />
              </div>
            </div>
            <div className="text-center">
              <div
                className="font-bold text-2xl"
                style={{ color: BRAND_COLOR }}
              >
                {totalPrice ? `${totalPrice.toFixed(0)}` : "0"}
              </div>
              <div className="text-gray-600 text-sm">
                <Translate content="subtotal (da)" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600 text-2xl">
                {isSignedIn
                  ? totalSavings
                    ? `${totalSavings.toFixed(0)}`
                    : "0"
                  : totalPrice
                  ? `${(totalPrice * 0.15).toFixed(0)}`
                  : "0"}
              </div>
              <div className="text-gray-600 text-sm">
                {isSignedIn ? (
                  <Translate content="customer savings (da)" />
                ) : (
                  <Translate content="potential savings (da)" />
                )}
              </div>
            </div>
          </div>
        </motion.div>
        {/* Suggestions for missing item types */}
        {!hasProducts && hasPacks && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-gradient-to-r from-blue-50 to-blue-100 mb-6 p-4 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center bg-blue-500 rounded-full w-10 h-10">
                <Icon
                  icon={allIcons.solid.faShoppingBag}
                  iconClassName="text-white text-lg"
                />
              </div>
              <div className="flex-grow">
                <h4 className="font-semibold text-blue-800 text-lg">
                  <Translate content="Add Individual Products!" />
                </h4>
                <p className="text-blue-700 text-sm">
                  <Translate content="You have packs in your cart. Consider adding individual products for more variety!" />
                </p>
              </div>
              <Button
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-all duration-200"
                onClick={() => history.push("/")}
              >
                <Translate content="Browse Products" />
              </Button>
            </div>
          </motion.div>
        )}
        {hasProducts && !hasPacks && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-gradient-to-r from-purple-50 to-purple-100 mb-6 p-4 border border-purple-200 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center bg-purple-500 rounded-full w-10 h-10">
                <Icon
                  icon={allIcons.solid.faBox}
                  iconClassName="text-white text-lg"
                />
              </div>
              <div className="flex-grow">
                <h4 className="font-semibold text-purple-800 text-lg">
                  <Translate content="Try Our Product Packs!" />
                </h4>
                <p className="text-purple-700 text-sm">
                  <Translate content="Save money with our curated product bundles - perfect combinations at great prices!" />
                </p>
              </div>
              <Button
                className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg text-white transition-all duration-200"
                onClick={() => history.push("/packs")}
              >
                <Translate content="View Packs" />
              </Button>
            </div>
          </motion.div>
        )}
        {/* Customer Benefits Banner - Only show when signed in */}
        {isSignedIn && totalSavings && totalSavings > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-gradient-to-r from-green-50 to-green-100 mb-6 p-4 border border-green-200 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div>
                <div className="flex justify-center items-center bg-green-500 rounded-full w-10 h-10">
                  <Icon
                    icon={allIcons.solid.faUserCheck}
                    iconClassName="text-white text-lg"
                  />
                </div>
              </div>
              <div className="flex-grow">
                <h4 className="font-semibold text-green-800 text-lg">
                  <Translate content="Customer Benefits Active!" />
                </h4>
                <p className="text-green-700 text-sm">
                  <Translate content="You're saving" />{" "}
                  <span className="font-bold">
                    {totalSavings.toFixed(0)} DA
                  </span>{" "}
                  <Translate content="with customer pricing on this order!" />
                </p>
              </div>
              <div className="text-green-800 text-right">
                <div className="font-bold text-2xl">
                  {totalSavings.toFixed(0)} DA
                </div>
                <div className="text-green-600 text-xs">
                  <Translate content="Total Savings" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {/* Delivery Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white shadow-sm mb-6 p-4 border border-gray-200 rounded-lg"
        >
          <h3 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 text-lg">
            <span style={{ color: BRAND_COLOR_PRIMARY }}>
              <Icon icon={allIcons.solid.faTruck} />
            </span>
            <Translate content="delivery options" />
          </h3>
          <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
            {deliveryOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setSelectedDelivery(option.id)}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedDelivery === option.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    icon={option.icon}
                    iconClassName={
                      selectedDelivery === option.id
                        ? "text-blue-600"
                        : "text-gray-600"
                    }
                  />
                  <span
                    className={`font-medium ${
                      selectedDelivery === option.id
                        ? "text-blue-900"
                        : "text-gray-900"
                    }`}
                  >
                    <Translate content={option.name} />
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    selectedDelivery === option.id
                      ? "text-blue-700"
                      : "text-gray-600"
                  }`}
                >
                  {option.duration} •{" "}
                  {option.price || <Translate content="free" />}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
        {/* Cart Items */}
        <div className="space-y-4">
          <AnimatePresence>
            {cartItems.map((item, index) => {
              const itemKey =
                item.type === "product" ? item.prodId : item.packId;
              return (
                <motion.div
                  key={itemKey}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -100, scale: 0.95 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  layout
                  whileHover={{ scale: 1.02 }}
                  className="overflow-hidden"
                >
                  <AsyncComponent
                    deps={[itemKey, item.count, item.type]}
                    render={async () => {
                      if (item.type === "product") {
                        // Regular product rendering
                        const product = await api.getProduct(item.prodId);
                        // Get pricing based on authentication state
                        let productPrice, totalItemPrice, priceDetails;
                        if (isSignedIn && product) {
                          // Show customer pricing when signed in
                          priceDetails = getProductPricesForCustomer(product);
                          productPrice = priceDetails.customerPrice;
                          totalItemPrice = (productPrice * item.count).toFixed(
                            2
                          );
                        } else {
                          // Show regular pricing when not signed in
                          productPrice = product ? getProductPrice(product) : 0;
                          totalItemPrice = (productPrice * item.count).toFixed(
                            2
                          );
                        }
                        return (
                          <motion.div
                            className="group bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-all duration-300"
                            whileHover={{
                              boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                            }}
                          >
                            <div className="flex gap-4">
                              {/* Product Image */}
                              <div className="flex-shrink-0">
                                <img
                                  src={product?.photos?.[0] || ""}
                                  alt={product?.name || ""}
                                  className="rounded-md w-20 h-20 object-cover"
                                />
                              </div>
                              {/* Product Details */}
                              <div className="flex-grow">
                                <h3
                                  className="mb-1 font-semibold text-gray-900 text-base"
                                  style={COMMON_STYLES.interFont}
                                >
                                  {product?.name}
                                </h3>
                              </div>
                              {/* Price */}
                              <div className="flex flex-col justify-between items-end">
                                <div className="text-right">
                                  {isSignedIn && priceDetails ? (
                                    // Show both customer and client prices when signed in
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="font-bold text-green-600 text-lg"
                                          style={COMMON_STYLES.interFont}
                                        >
                                          {priceDetails.customerPrice.toFixed(
                                            2
                                          )}{" "}
                                          DA
                                        </div>
                                        {priceDetails.hasDiscount && (
                                          <span
                                            className="px-2 py-1 rounded-full font-semibold text-white text-xs"
                                            style={{
                                              backgroundColor: "#10B981",
                                            }}
                                          >
                                            -{priceDetails.discountPercentage}%
                                          </span>
                                        )}
                                      </div>
                                      {priceDetails.hasDiscount && (
                                        <div className="flex items-center gap-1">
                                          <div
                                            className="text-gray-500 text-sm line-through"
                                            style={COMMON_STYLES.interFont}
                                          >
                                            {priceDetails.clientPrice.toFixed(
                                              2
                                            )}{" "}
                                            DA
                                          </div>
                                          <span className="text-gray-400 text-xs">
                                            <Translate content="Regular Price" />
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    // Show regular price when not signed in
                                    <div
                                      className="font-bold text-red-500 text-lg"
                                      style={COMMON_STYLES.interFont}
                                    >
                                      {productPrice.toFixed(2)} DA
                                    </div>
                                  )}
                                </div>
                                <div
                                  className={`font-bold text-xl ${
                                    isSignedIn && priceDetails?.hasDiscount
                                      ? "text-green-600"
                                      : "text-red-500"
                                  }`}
                                  style={COMMON_STYLES.interFont}
                                >
                                  {totalItemPrice} DA
                                </div>
                                {isSignedIn && priceDetails?.hasDiscount && (
                                  <div className="mt-1 text-green-600 text-xs">
                                    <Translate content="You save" />:{" "}
                                    {priceDetails.discountAmount.toFixed(2)} DA
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Actions */}
                            <div className="flex justify-between items-center mt-4 pt-3 border-gray-200 border-t">
                              <div className="flex gap-4">
                                <button
                                  onClick={() =>
                                    handleRemoveItem(item.prodId, "product")
                                  }
                                  className="font-medium text-sm underline"
                                  style={COMMON_STYLES.brandText}
                                >
                                  <Translate content="remove" />
                                </button>
                              </div>
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-3">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    handleMinusClick(
                                      item.prodId,
                                      item.count,
                                      product?.name || "Product",
                                      "product"
                                    )
                                  }
                                  className="flex justify-center items-center bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 rounded w-8 h-8 transition-all duration-200"
                                >
                                  <Icon
                                    icon={allIcons.solid.faMinus}
                                    iconClassName="text-xs text-gray-600"
                                  />
                                </motion.button>
                                <input
                                  type="number"
                                  value={item.count}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      item.prodId,
                                      parseInt(e.target.value),
                                      "product"
                                    )
                                  }
                                  className="border-gray-300 rounded-md w-12 text-center"
                                />
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.prodId,
                                      item.count + 1,
                                      "product"
                                    )
                                  }
                                  className="flex justify-center items-center hover:shadow-md rounded w-8 h-8 text-white transition-all duration-200"
                                  style={COMMON_STYLES.brandBackgroundOnly}
                                >
                                  <Icon
                                    icon={allIcons.solid.faPlus}
                                    iconClassName="text-xs"
                                  />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      } else {
                        // Pack rendering
                        const pack = item.packData;
                        const packPrice = pack.price || 0;
                        const totalPackPrice = (packPrice * item.count).toFixed(
                          2
                        );
                        return (
                          <motion.div
                            className="group bg-blue-50 hover:bg-blue-100 p-4 border-blue-500 border-l-4 rounded-lg transition-all duration-300"
                            whileHover={{
                              boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                            }}
                          >
                            <div className="flex gap-4">
                              {/* Pack Icon */}
                              <div className="flex-shrink-0">
                                <div className="flex justify-center items-center bg-blue-200 rounded-md w-20 h-20">
                                  <Icon
                                    icon={allIcons.solid.faBox}
                                    iconClassName="text-3xl text-blue-600"
                                  />
                                </div>
                              </div>
                              {/* Pack Details */}
                              <div className="flex-grow">
                                <h3
                                  className="mb-1 font-semibold text-blue-900 text-base"
                                  style={COMMON_STYLES.interFont}
                                >
                                  {pack.name} (Pack)
                                </h3>
                                <p className="text-blue-700 text-sm">
                                  Contains {pack.products?.length || 0}{" "}
                                  different products
                                </p>
                                <p className="text-blue-600 text-xs">
                                  Total items:{" "}
                                  {pack.products?.reduce(
                                    (sum, p) => sum + (p.count || 0),
                                    0
                                  ) || 0}
                                </p>
                              </div>
                              {/* Price */}
                              <div className="flex flex-col justify-between items-end">
                                <div className="text-right">
                                  <div
                                    className="font-bold text-blue-600 text-lg"
                                    style={COMMON_STYLES.interFont}
                                  >
                                    {packPrice.toFixed(2)} DA{" "}
                                  </div>
                                </div>
                                <div
                                  className="font-bold text-blue-600 text-xl"
                                  style={COMMON_STYLES.interFont}
                                >
                                  {totalPackPrice} DA
                                </div>
                              </div>
                            </div>
                            {/* Actions */}
                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-blue-200">
                              <div className="flex gap-4">
                                <button
                                  onClick={() =>
                                    handleRemoveItem(item.packId, "pack")
                                  }
                                  className="font-medium text-blue-600 text-sm underline"
                                >
                                  <Translate content="remove pack" />
                                </button>
                              </div>
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-3">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    handleMinusClick(
                                      item.packId,
                                      item.count,
                                      pack.name || "Pack",
                                      "pack"
                                    )
                                  }
                                  className="flex justify-center items-center bg-white hover:bg-blue-50 border border-blue-300 hover:border-blue-400 rounded w-8 h-8 transition-all duration-200"
                                >
                                  <Icon
                                    icon={allIcons.solid.faMinus}
                                    iconClassName="text-xs text-blue-600"
                                  />
                                </motion.button>
                                <input
                                  type="number"
                                  value={item.count}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      item.packId,
                                      parseInt(e.target.value),
                                      "pack"
                                    )
                                  }
                                  className="border-blue-300 rounded-md w-12 text-center"
                                />
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.packId,
                                      item.count + 1,
                                      "pack"
                                    )
                                  }
                                  className="flex justify-center items-center bg-blue-500 hover:bg-blue-600 hover:shadow-md rounded w-8 h-8 text-white transition-all duration-200"
                                >
                                  <Icon
                                    icon={allIcons.solid.faPlus}
                                    iconClassName="text-xs"
                                  />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      }
                    }}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        {/* Cart Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-r from-gray-50 to-gray-100 shadow-lg mt-6 p-6 rounded-xl"
        >
          <div className="flex justify-between items-center">
            {totalPrice && (
              <EmptyComponent>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="font-semibold text-gray-900 text-lg"
                  style={COMMON_STYLES.interFont}
                >
                  <Translate content="total" />
                </motion.span>
                <motion.span
                  key={totalPrice}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, type: "spring" }}
                  className="font-bold text-3xl"
                  style={COMMON_STYLES.brandText}
                >
                  {totalPrice?.toFixed(2)} DA
                </motion.span>
              </EmptyComponent>
            )}
            {totalPrice === null && (
              <EmptyComponent>
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Translate content="loading" />
                  ...
                </motion.div>
              </EmptyComponent>
            )}
          </div>
        </motion.div>
        {/* Recommended Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <AsyncComponent
            deps={[]}
            render={async () => {
              const allProducts = await api.getProducts();
              const recommendedProducts = allProducts
                ?.filter(
                  (product) =>
                    !cartItems?.some(
                      (item) =>
                        item.type === "product" && item.prodId === product.id
                    )
                )
                .slice(0, 4);
              return (
                <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
                  <h3 className="flex items-center gap-2 mb-6 font-semibold text-gray-900 text-xl">
                    <Icon
                      icon={allIcons.solid.faLightbulb}
                      iconClassName="text-yellow-500"
                    />
                    <Translate content="you might also like" />
                  </h3>
                  <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {recommendedProducts?.map((product) => (
                      <ProductCard product={product} key={product.id} />
                    ))}
                  </div>
                </div>
              );
            }}
          />
        </motion.div>
        {/* Cart Actions & Tips */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="items-start gap-6 grid grid-cols-1 md:grid-cols-2 mt-8"
        >
          {/* Shopping Tips */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border border-blue-200 rounded-lg">
            <h3 className="flex items-center gap-2 mb-4 font-semibold text-blue-900 text-lg">
              <Icon
                icon={allIcons.solid.faInfoCircle}
                iconClassName="text-blue-600"
              />
              <Translate content="shopping tips" />
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Icon
                  icon={allIcons.solid.faCheckCircle}
                  iconClassName="text-green-500 text-sm mt-1"
                />
                <p className="text-blue-800 text-sm">
                  <Translate content="free delivery on orders over 5000 da" />
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Icon
                  icon={allIcons.solid.faCheckCircle}
                  iconClassName="text-green-500 text-sm mt-1"
                />
                <p className="text-blue-800 text-sm">
                  <Translate content="30-day return policy on all items" />
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Icon
                  icon={allIcons.solid.faCheckCircle}
                  iconClassName="text-green-500 text-sm mt-1"
                />
                <p className="text-blue-800 text-sm">
                  <Translate content="secure payment with multiple options" />
                </p>
              </div>
            </div>
          </div>
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 border border-gray-200 rounded-lg">
            <h3 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 text-lg">
              <Icon
                icon={allIcons.solid.faBolt}
                iconClassName="text-yellow-500"
              />
              <Translate content="quick actions" />
            </h3>
            <div className="space-y-3">
              <Button
                className="hover:bg-red-50 px-4 py-2 border border-red-300 rounded-lg w-full font-medium text-red-600 transition-all duration-200"
                style={{ fontFamily: "Inter, sans-serif" }}
                onClick={handleClearCartClick}
              >
                <Icon icon={allIcons.solid.faTrash} iconClassName="mr-2" />
                <Translate content="clear cart" />
              </Button>
            </div>
          </div>
        </motion.div>
        {/* Order Summary Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white shadow-sm mt-8 p-6 border border-gray-200 rounded-lg"
        >
          <h3 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 text-lg">
            <Icon
              icon={allIcons.solid.faCalculator}
              iconClassName="text-blue-600"
            />
            <Translate content="order summary" />
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                <Translate content="subtotal" />
              </span>
              <span className="font-medium">
                {totalPrice ? `${totalPrice.toFixed(2)} DA` : "0.00 DA"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                <Translate content="delivery fee" />
              </span>
              <span className="font-medium">{deliveryFee.toFixed(2)} DA</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between items-center font-bold text-lg">
              <span>
                <Translate content="total" />
              </span>
              <span style={{ color: BRAND_COLOR }}>
                {totalPrice
                  ? `${(totalPrice + deliveryFee).toFixed(2)} DA`
                  : `${deliveryFee.toFixed(2)} DA`}
              </span>
            </div>
          </div>
        </motion.div>
        {/* CheckoutInformation Popup */}
        <CheckoutInformation
          isOpen={showCheckoutPopup}
          onClose={() => setShowCheckoutPopup(false)}
          totalPrice={totalPrice || 0}
          deliveryFee={deliveryFee}
        />
        {/* Confirmation Dialog */}
        <AnimatePresence>
          {showDeleteConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{
                  duration: 0.4,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                className="bg-white shadow-xl mx-4 p-6 rounded-xl w-full max-w-sm"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                    className="flex justify-center items-center bg-red-100 mx-auto mb-4 rounded-full w-12 h-12"
                  >
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="mb-2 font-semibold text-gray-900 text-lg"
                  >
                    <Translate content="remove product" />
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="mb-6 text-gray-600"
                  >
                    <Translate content="are you sure you want to remove" /> "
                    {productToDelete?.productName}"{" "}
                    <Translate content="from your cart?" />
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="flex space-x-3"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={cancelDeleteProduct}
                      className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg ${COMMON_STYLES.interFont} text-gray-700 hover:bg-gray-50 transition-all duration-200`}
                    >
                      <Translate content="cancel" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={confirmDeleteProduct}
                      className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-lg ${COMMON_STYLES.interFont} hover:bg-red-700 transition-all duration-200`}
                    >
                      <Translate content="remove" />
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Clear Cart Confirmation Dialog */}
        <AnimatePresence>
          {showClearCartDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4"
              onClick={cancelClearCart}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white shadow-2xl p-6 rounded-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center mb-4">
                  <div className="flex justify-center items-center bg-red-100 mr-4 rounded-full w-12 h-12">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-semibold capitalize text-gray-900 ${COMMON_STYLES.interFont}`}
                    >
                      <Translate content="clear cart" />
                    </h3>
                  </div>
                </div>
                <div className="bg-red-50 mb-6 p-3 border border-red-200 rounded-lg">
                  <p
                    className={`text-sm capitalize text-red-800 ${COMMON_STYLES.interFont}`}
                  >
                    <Translate content="this action is undone" />
                  </p>
                </div>
                <motion.div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={cancelClearCart}
                    className={`flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg ${COMMON_STYLES.interFont} hover:bg-gray-200 transition-all duration-200`}
                  >
                    <Translate content="cancel" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmClearCart}
                    className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-lg ${COMMON_STYLES.interFont} hover:bg-red-700 transition-all duration-200 font-medium`}
                  >
                    <Translate content="clear" />
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
