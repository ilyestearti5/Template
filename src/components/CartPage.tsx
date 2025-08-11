import { allIcons } from "@biqpod/app/ui/apis";
import { isWeb } from "@biqpod/app/ui/app";
import {
  AsyncComponent,
  EmptyComponent,
  Icon,
  Translate,
} from "@biqpod/app/ui/components";
import {
  useAsyncMemo,
  useAction,
  showToast,
  isLoading,
  execAction,
} from "@biqpod/app/ui/hooks";
import { Nothing } from "@biqpod/app/ui/types";
import { mapAsync, setFocused } from "@biqpod/app/ui/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useMemo, useRef, useEffect } from "react";
import { useHistory } from "react-router";
import { api, getAddressFromCoords } from "../api";
import { useFullCart, deleteCart, removeCart, addToCart } from "../hooks";
import { Button } from "./Custom";
import {
  getProductPrice,
  icons,
  getDiscountedPrice,
  COMMON_STYLES,
  BRAND_COLOR,
} from "./utils";
import { Geolocation } from "@capacitor/geolocation";
export const CustomCartView = () => {
  const cartItems = useFullCart();
  const history = useHistory();
  // Form state
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  // Location state
  const [latitude, setLatitude] = useState<Nothing | number>(null);
  const [longitude, setLongitude] = useState<Nothing | number>(null);
  // Get products for cart items
  // const totalPrice = useMemo(() => {
  //   if (!cartProducts) return 0;
  //   return cartProducts.reduce((total, item) => {
  //     if (!product) return total;
  //     const price = getProductPrice(product);
  //     return total + price * item.count;
  //   }, 0);
  // }, [cartProducts]);
  // Form values
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [showWilayaDropdown, setShowWilayaDropdown] = useState(false);
  const [selectedWilayaIndex, setSelectedWilayaIndex] = useState(-1);
  const wilayaDropdownRef = useRef<HTMLDivElement>(null);
  // Algerian Wilayas list
  const algerianWilayas = [
    "01 - Adrar",
    "02 - Chlef",
    "03 - Laghouat",
    "04 - Oum El Bouaghi",
    "05 - Batna",
    "06 - Béjaïa",
    "07 - Biskra",
    "08 - Béchar",
    "09 - Blida",
    "10 - Bouira",
    "11 - Tamanrasset",
    "12 - Tébessa",
    "13 - Tlemcen",
    "14 - Tiaret",
    "15 - Tizi Ouzou",
    "16 - Alger",
    "17 - Djelfa",
    "18 - Jijel",
    "19 - Sétif",
    "20 - Saïda",
    "21 - Skikda",
    "22 - Sidi Bel Abbès",
    "23 - Annaba",
    "24 - Guelma",
    "25 - Constantine",
    "26 - Médéa",
    "27 - Mostaganem",
    "28 - M'Sila",
    "29 - Mascara",
    "30 - Ouargla",
    "31 - Oran",
    "32 - El Bayadh",
    "33 - Illizi",
    "34 - Bordj Bou Arréridj",
    "35 - Boumerdès",
    "36 - El Tarf",
    "37 - Tindouf",
    "38 - Tissemsilt",
    "39 - El Oued",
    "40 - Khenchela",
    "41 - Souk Ahras",
    "42 - Tipaza",
    "43 - Mila",
    "44 - Aïn Defla",
    "45 - Naâma",
    "46 - Aïn Témouchent",
    "47 - Ghardaïa",
    "48 - Relizane",
    "49 - Timimoun",
    "50 - Bordj Badji Mokhtar",
    "51 - Ouled Djellal",
    "52 - Béni Abbès",
    "53 - In Salah",
    "54 - In Guezzam",
    "55 - Touggourt",
    "56 - Djanet",
    "57 - El M'Ghair",
    "58 - El Meniaa",
  ];
  // Initialize form with user data
  // Auto-detect location action
  const locationAction = useAction(
    "auto-detect-location",
    async () => {
      try {
        if (isWeb) {
          await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const coords = position.coords;
                setLatitude(coords.latitude);
                setLongitude(coords.longitude);
                try {
                  const addressInfo = await getAddressFromCoords(
                    coords.latitude,
                    coords.longitude
                  );
                  if (addressInfo.wilaya) {
                    setWilaya(addressInfo.wilaya);
                  }
                  if (addressInfo.fullAddress) {
                    setAddress(addressInfo.fullAddress);
                  }
                } catch (err) {
                  console.warn("Could not get address from coordinates");
                }
                resolve(coords);
              },
              (error) => {
                showToast("Geolocation error: " + error.message, "error");
                reject(new Error("Geolocation error: " + error.message));
              }
            );
          });
        } else {
          let permStatus = await Geolocation.checkPermissions();
          if (permStatus.location !== "granted") {
            permStatus = await Geolocation.requestPermissions();
            if (permStatus.location !== "granted") {
              showToast("Location permission denied", "error");
              return;
            }
          }
          const position = await Geolocation.getCurrentPosition();
          const coords = position.coords;
          setLatitude(coords.latitude);
          setLongitude(coords.longitude);
          try {
            const addressInfo = await getAddressFromCoords(
              coords.latitude,
              coords.longitude
            );
            if (addressInfo.wilaya) {
              setWilaya(addressInfo.wilaya);
            }
            if (addressInfo.fullAddress) {
              setAddress(addressInfo.fullAddress);
            }
          } catch (err) {
            console.warn("Could not get address from coordinates");
          }
        }
        showToast("Location detected successfully", "success");
      } catch (error) {
        showToast("Failed to detect location", "error");
      }
    },
    []
  );
  // Create order action
  const handleCreateOrder = async () => {
    setIsSubmittingOrder(true);
    try {
      if (!firstname) {
        setFocused("client-firstname");
        showToast("Enter Your First Name", "info");
        return;
      }
      if (!lastname) {
        setFocused("client-lastname");
        showToast("Enter Your Last Name", "info");
        return;
      }
      if (!phone) {
        setFocused("client-phone");
        showToast("Enter Your Phone Number", "info");
        return;
      }
      if (!address) {
        setFocused("client-address");
        showToast("Enter Your Address", "info");
        return;
      }
      if (!wilaya) {
        setFocused("client-wilaya");
        showToast("Enter Your Wilaya", "info");
        return;
      }
      const carts = cartItems.reduce((acc, item) => {
        acc[item.prodId] = { count: item.count };
        return acc;
      }, {} as any);
      localStorage.setItem("phone", phone);
      const place: any = {
        address,
        wilaya,
      };
      if (latitude) place.latitude = latitude;
      if (longitude) place.longitude = longitude;
      const options: CreateOrderOptions = {
        products: carts,
        client: {
          firstname,
          lastname,
          phone,
          id: crypto.randomUUID(),
          place,
        },
        delivery: false,
        metaData: {},
      };
      await api.createOrder(options);
      showToast("Order Created Successfully", "success");
      deleteCart();
      setShowShippingForm(false);
      history.push("/");
    } catch (error) {
      showToast("Failed to create order", "error");
    } finally {
      setIsSubmittingOrder(false);
    }
  };
  const handleQuantityChange = (prodId: string, newCount: number) => {
    if (newCount <= 0) {
      removeCart(prodId);
    } else {
      addToCart(prodId, newCount);
    }
  };
  const handleMinusClick = (
    prodId: string,
    currentCount: number,
    productName: string
  ) => {
    if (currentCount === 1) {
      // Show confirmation dialog when removing the last item
      setProductToDelete({ prodId, productName });
      setShowDeleteConfirmation(true);
    } else {
      // Decrease quantity normally
      handleQuantityChange(prodId, currentCount - 1);
    }
  };
  const confirmDeleteProduct = () => {
    if (productToDelete) {
      removeCart(productToDelete.prodId);
      setShowDeleteConfirmation(false);
      setProductToDelete(null);
    }
  };
  const cancelDeleteProduct = () => {
    setShowDeleteConfirmation(false);
    setProductToDelete(null);
  };
  const handleRemoveItem = (prodId: string) => {
    removeCart(prodId);
  };
  // Shipping form state
  const [showShippingForm, setShowShippingForm] = useState(false);
  // Confirmation dialog state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    prodId: string;
    productName: string;
  } | null>(null);
  // Filter wilaya based on search
  const filteredWilayas = useMemo(() => {
    if (!wilaya) return algerianWilayas;
    return algerianWilayas.filter((w) =>
      w.toLowerCase().includes(wilaya.toLowerCase())
    );
  }, [wilaya, algerianWilayas]);
  // Handle wilaya selection
  const handleWilayaSelect = (selectedWilaya: string) => {
    // Extract just the name part (after " - ")
    const wilayaName = selectedWilaya.split(" - ")[1] || selectedWilaya;
    setWilaya(wilayaName);
    setShowWilayaDropdown(false);
    setSelectedWilayaIndex(-1);
  };
  // Handle wilaya input change
  const handleWilayaChange = (value: string) => {
    setWilaya(value);
    setShowWilayaDropdown(true);
    setSelectedWilayaIndex(-1);
  };
  // Handle keyboard navigation for wilaya dropdown
  const handleWilayaKeyDown = (e: React.KeyboardEvent) => {
    if (!showWilayaDropdown) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedWilayaIndex((prev) =>
          prev < filteredWilayas.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedWilayaIndex((prev) =>
          prev > 0 ? prev - 1 : filteredWilayas.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedWilayaIndex >= 0) {
          handleWilayaSelect(filteredWilayas[selectedWilayaIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowWilayaDropdown(false);
        setSelectedWilayaIndex(-1);
        break;
    }
  };
  // Scroll selected item into view
  useEffect(() => {
    if (selectedWilayaIndex >= 0 && wilayaDropdownRef.current) {
      const selectedElement = wilayaDropdownRef.current.children[
        selectedWilayaIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedWilayaIndex]);
  const isLocationLoading = isLoading(locationAction);
  const totalPrice = useAsyncMemo(async () => {
    const result = await mapAsync(cartItems, async (item) => {
      const product = await api.getProduct(item.prodId);
      if (!product) return 0;
      return getProductPrice(product) * item.count;
    });
    return result.reduce((acc, curr) => acc + curr, 0);
  }, [cartItems]);
  if (!cartItems || cartItems.length === 0) {
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
              <Translate content="Your cart is empty" />
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-gray-600"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Translate content="Add some products to get started" />
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                className="shadow-lg hover:shadow-xl px-6 py-3 border-2 rounded-lg font-semibold text-white transition-all duration-200"
                style={{
                  backgroundColor: BRAND_COLOR,
                  borderColor: BRAND_COLOR,
                  fontFamily: "Inter, sans-serif",
                }}
                onClick={() => history.push("/")}
              >
                <Translate content="Continue Shopping" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto px-6 py-6 max-w-4xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => history.push("/")}
              className="hover:underline"
              style={{
                fontFamily: "Inter, sans-serif",
                color: BRAND_COLOR,
              }}
            >
              <Translate content="Home" />
            </button>
            <span className="text-gray-400">{">"}</span>
            <span
              className="text-gray-600"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Translate content="Cart" />
            </span>
          </div>
        </div>
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
              Cart ({cartItems?.length || 0} item
              {cartItems?.length !== 1 ? "s" : ""})
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
                <Translate content="Continue Shopping" />
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
              onClick={() => setShowShippingForm(true)}
              disabled={isSubmittingOrder}
            >
              <Translate content="Checkout" />
            </Button>
          </motion.div>
        </motion.div>
        {/* Cart Items */}
        <div className="space-y-4">
          <AnimatePresence>
            {cartItems.map((item, index) => {
              // Optimize repeated calculations for each cart item
              return (
                <motion.div
                  key={item.prodId}
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
                    deps={[item.prodId, item.count]}
                    render={async () => {
                      const product = await api.getProduct(item.prodId);
                      const productPrice = product
                        ? getProductPrice(product)
                        : 0;
                      const discountedPriceStr =
                        getDiscountedPrice(productPrice);
                      const totalItemPrice = (
                        productPrice * item.count
                      ).toFixed(2);
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
                              {/* Product specifications */}
                              <div className="space-y-1 text-gray-600 text-sm">
                                <div style={COMMON_STYLES.interFont}>
                                  <span className="font-medium">Fit:</span>{" "}
                                  <span>Male Fit</span>
                                </div>
                                <div style={COMMON_STYLES.interFont}>
                                  <span className="font-medium">Style:</span>{" "}
                                  <span>Classic T-Shirt</span>
                                </div>
                                <div style={COMMON_STYLES.interFont}>
                                  <span className="font-medium">Size:</span>{" "}
                                  <span>Small</span>
                                </div>
                                <div style={COMMON_STYLES.interFont}>
                                  <span className="font-medium">Color:</span>{" "}
                                  <span>White</span>
                                </div>
                              </div>
                            </div>
                            {/* Price */}
                            <div className="flex flex-col justify-between items-end">
                              <div className="text-right">
                                <div
                                  className="font-bold text-red-500 text-lg"
                                  style={COMMON_STYLES.interFont}
                                >
                                  {productPrice.toFixed(2)} DA{" "}
                                  <span className="text-sm">each</span>
                                </div>
                                <div
                                  className="text-gray-500 text-sm line-through"
                                  style={COMMON_STYLES.interFont}
                                >
                                  {discountedPriceStr} DA
                                </div>
                              </div>
                              <div
                                className="font-bold text-red-500 text-xl"
                                style={COMMON_STYLES.interFont}
                              >
                                {totalItemPrice} DA
                              </div>
                            </div>
                          </div>
                          {/* Actions */}
                          <div className="flex justify-between items-center mt-4 pt-3 border-gray-200 border-t">
                            <div className="flex gap-4">
                              <button
                                onClick={() => handleRemoveItem(item.prodId)}
                                className="font-medium text-sm underline"
                                style={COMMON_STYLES.brandText}
                              >
                                <Translate content="Remove" />
                              </button>
                              <button
                                className="font-medium text-sm underline"
                                style={COMMON_STYLES.brandText}
                              >
                                <Translate content="Update" />
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
                                    product?.name || "Product"
                                  )
                                }
                                className="flex justify-center items-center bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 rounded w-8 h-8 transition-all duration-200"
                              >
                                <Icon
                                  icon={allIcons.solid.faMinus}
                                  iconClassName="text-xs text-gray-600"
                                />
                              </motion.button>
                              <motion.span
                                key={item.count}
                                initial={{ scale: 1.2, color: "#3B82F6" }}
                                animate={{ scale: 1, color: "#000000" }}
                                transition={{ duration: 0.3 }}
                                className="w-8 font-medium text-center"
                                style={COMMON_STYLES.interFont}
                              >
                                {item.count}
                              </motion.span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  handleQuantityChange(
                                    item.prodId,
                                    item.count + 1
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
                  <Translate content="Total" />
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
        {/* Shipping Information Form */}
        <AnimatePresence>
          {showShippingForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="mt-8 pt-8 border-gray-200 border-t overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg p-6 rounded-xl"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2
                    className="font-bold text-gray-900 text-xl"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <Translate content="Shipping Information" />
                  </h2>
                  <button
                    onClick={() => setShowShippingForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Icon
                      icon={allIcons.solid.faTimes}
                      iconClassName="text-xl"
                    />
                  </button>
                </div>
                {/* Form Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="gap-4 grid grid-cols-1 md:grid-cols-2"
                >
                  {/* First Name */}
                  <div>
                    <label
                      className="block mb-1 font-medium text-gray-700 text-sm"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <Translate content="First Name" />
                    </label>
                    <input
                      type="text"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 w-full"
                      style={
                        {
                          fontFamily: "Inter, sans-serif",
                          "--tw-ring-color": BRAND_COLOR,
                        } as React.CSSProperties
                      }
                      placeholder="Enter your first name"
                    />
                  </div>
                  {/* Last Name */}
                  <div>
                    <label
                      className="block mb-1 font-medium text-gray-700 text-sm"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <Translate content="Last Name" />
                    </label>
                    <input
                      type="text"
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 w-full"
                      style={
                        {
                          fontFamily: "Inter, sans-serif",
                          "--tw-ring-color": BRAND_COLOR,
                        } as React.CSSProperties
                      }
                      placeholder="Enter your last name"
                    />
                  </div>
                  {/* Phone */}
                  <div>
                    <label
                      className="block mb-1 font-medium text-gray-700 text-sm"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <Translate content="Phone Number" />
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 w-full"
                      style={
                        {
                          fontFamily: "Inter, sans-serif",
                          "--tw-ring-color": BRAND_COLOR,
                        } as React.CSSProperties
                      }
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {/* Wilaya */}
                  <div className="relative">
                    <label
                      className="block mb-1 font-medium text-gray-700 text-sm"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <Translate content="Wilaya" />
                    </label>
                    <input
                      type="text"
                      value={wilaya}
                      onChange={(e) => handleWilayaChange(e.target.value)}
                      onKeyDown={handleWilayaKeyDown}
                      onFocus={() => setShowWilayaDropdown(true)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 w-full"
                      style={
                        {
                          fontFamily: "Inter, sans-serif",
                          "--tw-ring-color": BRAND_COLOR,
                        } as React.CSSProperties
                      }
                      placeholder="Select or type wilaya..."
                      autoComplete="off"
                    />
                    {/* Wilaya Dropdown */}
                    {showWilayaDropdown && filteredWilayas.length > 0 && (
                      <div
                        ref={wilayaDropdownRef}
                        className="z-10 absolute bg-white shadow-lg mt-1 border border-gray-300 rounded-md w-full max-h-60 overflow-y-auto"
                      >
                        {filteredWilayas.map((wilayaOption, index) => (
                          <div
                            key={wilayaOption}
                            onClick={() => handleWilayaSelect(wilayaOption)}
                            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                              index === selectedWilayaIndex ? "" : ""
                            }`}
                            style={{
                              fontFamily: "Inter, sans-serif",
                              backgroundColor:
                                index === selectedWilayaIndex
                                  ? "#e5f7fd"
                                  : undefined,
                            }}
                          >
                            {wilayaOption}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Address/Place - Full Width */}
                  <div className="md:col-span-2">
                    <label
                      className="block mb-1 font-medium text-gray-700 text-sm"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <Translate content="Address" />
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                        style={
                          {
                            fontFamily: "Inter, sans-serif",
                            "--tw-ring-color": BRAND_COLOR,
                          } as React.CSSProperties
                        }
                        placeholder="Enter your full address"
                      />
                      <button
                        onClick={() => {
                          execAction("");
                        }}
                        disabled={isLocationLoading}
                        className="self-start hover:bg-gray-50 px-3 py-2 border border-gray-300 rounded-md transition-colors duration-200"
                        style={{ fontFamily: "Inter, sans-serif" }}
                        title="Auto-detect location"
                      >
                        {isLocationLoading ? (
                          <Icon
                            icon={allIcons.solid.faSpinner}
                            iconClassName="text-sm animate-spin"
                          />
                        ) : (
                          <Icon
                            icon={allIcons.solid.faLocationArrow}
                            iconClassName="text-sm"
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex gap-3 mt-6"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      className="hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-md w-full font-medium text-gray-700 transition-all duration-200"
                      style={{ fontFamily: "Inter, sans-serif" }}
                      onClick={() => setShowShippingForm(false)}
                    >
                      <Translate content="Cancel" />
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      className="shadow-lg hover:shadow-xl px-4 py-2 rounded-md w-full font-medium text-white transition-all duration-200"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        backgroundColor: BRAND_COLOR,
                        borderColor: BRAND_COLOR,
                      }}
                      onClick={handleCreateOrder}
                      disabled={isSubmittingOrder}
                    >
                      {isSubmittingOrder ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-center items-center"
                        >
                          <Icon
                            icon={allIcons.solid.faSpinner}
                            iconClassName="mr-2 animate-spin"
                          />
                          <Translate content="Processing..." />
                        </motion.div>
                      ) : (
                        <Translate content="Place Order" />
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
                    Remove Product
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="mb-6 text-gray-600"
                  >
                    Are you sure you want to remove "
                    {productToDelete?.productName}" from your cart?
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
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={confirmDeleteProduct}
                      className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-lg ${COMMON_STYLES.interFont} hover:bg-red-700 transition-all duration-200`}
                    >
                      Remove
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
