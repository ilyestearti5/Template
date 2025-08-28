import { allIcons } from "@biqpod/app/ui/apis";
import { isWeb } from "@biqpod/app/ui/app";
import { Icon, Translate } from "@biqpod/app/ui/components";
import { showToast } from "@biqpod/app/ui/hooks";
import { Nothing } from "@biqpod/app/ui/types";
import { setFocused } from "@biqpod/app/ui/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { useHistory } from "react-router";
import { api, getAddressFromCoords, initPixels, useStore } from "../api";
import {
  deleteCart,
  useFullCartItems,
  useCustomer,
  FullCartItem,
} from "../hooks";
import { Button } from "./Custom";
import { BRAND_COLOR } from "./utils";
import { Geolocation } from "@capacitor/geolocation";
import placesData from "../../public/places.json";
interface CheckoutInformationProps {
  isOpen: boolean;
  onClose: () => void;
  totalPrice: number;
  deliveryFee: number;
  cart?: FullCartItem[]; // Optional cart prop, if not provided, uses full cart
}
export const CheckoutInformation: React.FC<CheckoutInformationProps> = ({
  isOpen,
  onClose,
  totalPrice,
  deliveryFee,
  cart,
}) => {
  const defaultCartItems = useFullCartItems(); // This now includes both products and packs
  const cartItems = cart || defaultCartItems; // Use provided cart or default full cart
  const history = useHistory();
  const customer = useCustomer();
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  // Location state
  const [latitude, setLatitude] = useState<Nothing | number>(null);
  const [longitude, setLongitude] = useState<Nothing | number>(null);
  // Form values - Initialize with customer data if signed in
  const [firstname, setFirstname] = useState(customer?.firstname || "");
  const [lastname, setLastname] = useState(customer?.lastname || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [address, setAddress] = useState("");
  const [wilaya, setWilaya] = useState("");
  // Places data state
  // Update form fields when customer data changes
  useEffect(() => {
    if (customer) {
      setFirstname(customer.firstname || "");
      setLastname(customer.lastname || "");
      setPhone(customer.phone || "");
    } else {
      setFirstname("");
      setLastname("");
      setPhone("");
    }
  }, [customer]);
  // Load places data
  // Get unique wilayas from places data, sorted by wilaya_code
  const uniqueWilayas = useMemo(() => {
    const wilayaMap = new Map<string, { code: string; name: string }>();
    placesData.forEach((place) => {
      const key = place.wilaya_code;
      if (!wilayaMap.has(key)) {
        wilayaMap.set(key, {
          code: place.wilaya_code,
          name: place.wilaya_name_ascii,
        });
      }
    });
    return Array.from(wilayaMap.values()).sort((a, b) =>
      a.code.localeCompare(b.code)
    );
  }, []);
  // Get addresses for selected wilaya
  const availableAddresses = useMemo(() => {
    if (!wilaya) return [];
    return placesData
      .filter((place) => place.wilaya_name_ascii === wilaya)
      .map((place) => place.commune_name_ascii)
      .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
      .sort();
  }, [wilaya]);

  // Handle wilaya change
  const handleWilayaChange = (selectedWilaya: string) => {
    setWilaya(selectedWilaya);
    setAddress(""); // Clear address when wilaya changes
  };

  // Handle address change
  const handleAddressChange = (selectedAddress: string) => {
    setAddress(selectedAddress);
  };
  // Handle location detection
  const handleLocationDetection = async () => {
    setIsDetectingLocation(true);
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
    } finally {
      setIsDetectingLocation(false);
    }
  };
  // Create order action
  const store = useStore();
  const pixels = initPixels(store);
  const handleCreateOrder = async () => {
    setIsSubmittingOrder(true);
    try {
      // Skip validation for customer info if signed in (already have it)
      if (!customer) {
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
      var products: SnapBuy.Order["products"] = {};
      var packs: SnapBuy.Order["packs"] = {};
      for (const item of cartItems) {
        const cartId = item.type === "pack" ? item.packId : item.prodId;
        if (item.type === "pack") {
          packs[cartId] = { count: item.count };
        } else {
          products[cartId] = { count: item.count };
        }
      }
      localStorage.setItem("phone", phone);
      const place: CreateOrderOptions["place"] = {
        address,
        wilaya,
      };
      if (latitude) place.latitude = latitude;
      if (longitude) place.longitude = longitude;
      const options = {
        products,
        packs,
        client: {
          firstname,
          lastname,
          phone,
          id: crypto.randomUUID(),
        },
        place,
        delivery: false,
        metaData: {},
      };
      const response = await api.createOrder(options);
      response && (await pixels?.purchase(response));
      showToast("Order Created Successfully", "success");
      deleteCart();
      onClose();
      history.push("/order-success");
    } catch (error) {
      showToast("Failed to create order", "error");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Close popup when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{
            duration: 0.4,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="bg-white shadow-2xl rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="top-0 sticky flex justify-between items-center bg-white shadow-sm px-6 py-4 border-gray-200 border-b">
              <h2
                className="font-bold text-gray-900 text-2xl"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <Translate content="checkout information" />
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <Icon icon={allIcons.solid.faTimes} iconClassName="text-2xl" />
              </motion.button>
            </div>
            <div className="p-6">
              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gradient-to-r from-gray-50 to-gray-100 mb-6 p-4 rounded-lg"
              >
                <h3 className="flex items-center gap-2 mb-3 font-semibold text-gray-900 text-lg">
                  <Icon
                    icon={allIcons.solid.faShoppingCart}
                    iconClassName="text-blue-600"
                  />
                  <Translate content="order summary" />
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      <Translate content="subtotal" />
                    </span>
                    <span className="font-medium">
                      {totalPrice.toFixed(2)} DA
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      <Translate content="delivery fee" />
                    </span>
                    <span className="font-medium">
                      {deliveryFee.toFixed(2)} DA
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>
                      <Translate content="total" />
                    </span>
                    <span style={{ color: BRAND_COLOR }}>
                      {(totalPrice + deliveryFee).toFixed(2)} DA
                    </span>
                  </div>
                </div>
              </motion.div>
              {/* Shipping Information Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 text-lg">
                  <Icon
                    icon={allIcons.solid.faUser}
                    iconClassName="text-green-600"
                  />
                  <Translate content="shipping information" />
                </h3>
                {/* Customer Info Section */}
                {customer ? (
                  /* Signed-in Customer Display */
                  <div className="bg-green-50 mb-6 p-4 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon
                        icon={allIcons.solid.faCheckCircle}
                        iconClassName="text-green-600"
                      />
                      <span
                        className="font-medium text-green-800"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        <Translate content="signed in as customer" />
                      </span>
                    </div>
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-3 text-sm">
                      <div>
                        <span className="font-medium text-green-700">
                          <Translate content="first name" />:
                        </span>
                        <p className="text-green-800">{customer.firstname}</p>
                      </div>
                      <div>
                        <span className="font-medium text-green-700">
                          <Translate content="last name" />:
                        </span>
                        <p className="text-green-800">{customer.lastname}</p>
                      </div>
                      <div>
                        <span className="font-medium text-green-700">
                          <Translate content="phone number" />:
                        </span>
                        <p className="text-green-800">{customer.phone}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Guest User Form Fields */
                  <div className="gap-4 grid grid-cols-1 md:grid-cols-2 mb-6">
                    {/* First Name */}
                    <div>
                      <label
                        className="block mb-1 font-medium text-gray-700 text-sm"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        <Translate content="first name" />
                      </label>
                      <input
                        id="client-firstname"
                        type="text"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        className="px-3 py-2 border border-gray-300 border-solid rounded-md focus:outline-none focus:ring-2 w-full"
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
                        <Translate content="last name" />
                      </label>
                      <input
                        id="client-lastname"
                        type="text"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        className="px-3 py-2 border border-gray-300 border-solid rounded-md focus:outline-none focus:ring-2 w-full"
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
                    <div className="md:col-span-2">
                      <label
                        className="block mb-1 font-medium text-gray-700 text-sm"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        <Translate content="phone number" />
                      </label>
                      <input
                        id="client-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="px-3 py-2 border border-gray-300 border-solid rounded-md focus:outline-none focus:ring-2 w-full"
                        style={
                          {
                            fontFamily: "Inter, sans-serif",
                            "--tw-ring-color": BRAND_COLOR,
                          } as React.CSSProperties
                        }
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                )}
                {/* Delivery Address Section - Always shown */}
                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  {/* Wilaya */}
                  <div>
                    <label
                      className="block mb-1 font-medium text-gray-700 text-sm"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <Translate content="wilaya" />
                    </label>
                    <select
                      id="client-wilaya"
                      value={wilaya}
                      onChange={(e) => handleWilayaChange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 border-solid rounded-md focus:outline-none focus:ring-2 w-full"
                      style={
                        {
                          fontFamily: "Inter, sans-serif",
                          "--tw-ring-color": BRAND_COLOR,
                        } as React.CSSProperties
                      }
                    >
                      <option value="">Select a wilaya...</option>
                      {uniqueWilayas.map((wilayaOption) => (
                        <option
                          key={wilayaOption.code}
                          value={wilayaOption.name}
                        >
                          {wilayaOption.code} - {wilayaOption.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Address/Place */}
                  <div>
                    <label
                      className="block mb-1 font-medium text-gray-700 text-sm"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <Translate content="address" />
                    </label>
                    <div className="flex gap-2">
                      <select
                        id="client-address"
                        value={address}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 border-solid rounded-md focus:outline-none focus:ring-2"
                        style={
                          {
                            fontFamily: "Inter, sans-serif",
                            "--tw-ring-color": BRAND_COLOR,
                          } as React.CSSProperties
                        }
                        disabled={!wilaya}
                      >
                        <option value="">
                          {wilaya
                            ? "Select an address..."
                            : "Please select a wilaya first"}
                        </option>
                        {availableAddresses.map((addressOption) => (
                          <option key={addressOption} value={addressOption}>
                            {addressOption}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleLocationDetection}
                        disabled={isDetectingLocation}
                        className="self-start hover:bg-gray-50 px-3 py-2 border border-gray-300 rounded-md transition-colors duration-200"
                        style={{ fontFamily: "Inter, sans-serif" }}
                        title="Auto-detect location"
                      >
                        {isDetectingLocation ? (
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
                </div>
              </motion.div>
            </div>
            {/* Footer Actions */}
            <div className="bottom-0 sticky flex gap-3 bg-white shadow-lg px-6 py-4 border-gray-200 border-t">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  className="hover:bg-gray-50 px-4 py-3 border border-gray-300 rounded-md w-full font-medium text-gray-700 transition-all duration-200"
                  style={{ fontFamily: "Inter, sans-serif" }}
                  onClick={onClose}
                  disabled={isSubmittingOrder}
                >
                  <Translate content="cancel" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  className="shadow-lg hover:shadow-xl px-4 py-3 rounded-md w-full font-medium text-white transition-all duration-200"
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
                      <Translate content="processing..." />
                    </motion.div>
                  ) : (
                    <div className="flex justify-center items-center">
                      <Icon
                        icon={allIcons.solid.faShoppingCart}
                        iconClassName="mr-2"
                      />
                      <Translate content="place order" />
                    </div>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
