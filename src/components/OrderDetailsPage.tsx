import { allIcons } from "@biqpod/app/ui/apis";
import { Icon, Translate } from "@biqpod/app/ui/components";
import { useAsyncMemo, showToast } from "@biqpod/app/ui/hooks";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useHistory, useParams } from "react-router";
import { api } from "../api";
import { useIsSignedIn } from "../hooks";
import { Breadcrumb } from "./Breadcrumb";
import { BRAND_COLOR_PRIMARY } from "./utils";
interface OrderDetailsParams {
  orderId: string;
}
// Utility functions
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-DZ").format(price);
};
const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
const getOrderStatusColor = (status?: SnapBuy.OrderStatus): string => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "processing":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "delivery":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "completed":
    case "done":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};
const getOrderStatusIcon = (status?: SnapBuy.OrderStatus) => {
  switch (status) {
    case "pending":
      return allIcons.solid.faClock;
    case "processing":
      return allIcons.solid.faCog;
    case "delivery":
      return allIcons.solid.faTruck;
    case "completed":
    case "done":
      return allIcons.solid.faCheck;
    case "cancelled":
      return allIcons.solid.faTimes;
    default:
      return allIcons.solid.faQuestion;
  }
};
export const OrderDetailsPage = () => {
  const { orderId } = useParams<OrderDetailsParams>();
  const history = useHistory();
  const isSignedIn = useIsSignedIn();
  // Redirect if not signed in
  // Fetch order details
  const order = useAsyncMemo(async () => {
    // Since we don't have a getOrder by ID API, we'll fetch all orders and find the one
    const orders = await api.getMyOrders(100, "");
    return orders?.find((o) => o.id === orderId) || null;
  }, [orderId]);
  // Fetch products data for the order
  const orderProducts = useAsyncMemo(async () => {
    if (!order?.products) return [];
    const productPromises = Object.keys(order.products).map(
      async (productId) => {
        const product = await api.getProduct(productId);
        const orderInfo = order.products![productId];
        return {
          product,
          count: orderInfo?.count || 1,
          price: orderInfo?.price || 0,
        };
      }
    );
    return await Promise.all(productPromises);
  }, [order?.products]);
  // Fetch packs data for the order
  const orderPacks = useAsyncMemo(async () => {
    if (!order?.packs) return [];
    const packPromises = Object.keys(order.packs).map(async (packId) => {
      const pack = await api.getPack(packId);
      const orderInfo = order.packs![packId];
      return {
        pack,
        count: orderInfo?.count || 1,
        price: orderInfo?.price || 0,
      };
    });
    return await Promise.all(packPromises);
  }, [order?.packs]);
  const orderDate = useMemo(() => {
    if (order?.createdAt) {
      return formatDate(order.createdAt);
    }
    return "Unknown";
  }, [order?.createdAt]);
  const totalItems = useMemo(() => {
    if (!order) return 0;
    const productCount = Object.values(order.products || {}).reduce(
      (sum, item) => sum + (item?.count || 0),
      0
    );
    const packCount = Object.values(order.packs || {}).reduce(
      (sum, item) => sum + (item?.count || 0),
      0
    );
    return productCount + packCount;
  }, [order?.products, order?.packs]);
  const statusColor = getOrderStatusColor(order?.status);
  const statusIcon = getOrderStatusIcon(order?.status);
  if (!order) {
    return (
      <div className="flex justify-center items-center bg-gray-50 min-h-screen">
        <div className="text-center">
          <Icon
            icon={allIcons.solid.faSpinner}
            iconClassName="text-4xl text-gray-400 animate-spin mb-4"
          />
          <p className="text-gray-600">
            <Translate content="Loading order details..." />
          </p>
        </div>
      </div>
    );
  }
  if (isSignedIn === false) {
    return null;
  }
  return (
    <div className="relative bg-gray-50 min-h-screen">
      {/* Header */}
      <Breadcrumb
        className="top-0 z-10 sticky border-gray-200 border-b border-solid"
        items={[
          {
            label: "Home",
            onClick: () => history.push("/"),
            isTranslatable: true,
          },
          {
            label: "My Orders",
            onClick: () => history.push("/orders"),
            isTranslatable: true,
          },
          {
            label: `Order #${order.id?.slice(-8)}`,
            isTranslatable: false,
          },
        ]}
      />
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Order Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-md mb-6 border border-gray-200 rounded-lg"
        >
          <div className="p-6">
            <div className="flex sm:flex-row flex-col justify-between items-start gap-4">
              <div>
                <h1 className="mb-2 font-bold text-gray-900 text-2xl">
                  <Translate content="Order" /> #{order.id?.slice(-8)}
                </h1>
                <div className="space-y-1 text-gray-600 text-sm">
                  <p>
                    <Translate content="Order Date" />: {orderDate}
                  </p>
                  <p>
                    <Translate content="Total Items" />: {totalItems}
                  </p>
                  {order.client && (
                    <p>
                      <Translate content="Customer" />: {order.client.firstname}{" "}
                      {order.client.lastname}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${statusColor}`}
                >
                  <Icon icon={statusIcon} iconClassName="text-sm" />
                  <span className="font-medium capitalize">
                    <Translate content={order.status} />
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-gray-600 text-sm">
                    <Translate content="Total Amount" />
                  </p>
                  <p className="font-bold text-gray-900 text-2xl">
                    {formatPrice(order.totalPrice || 0)} DA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white shadow-md mb-6 border border-gray-200 rounded-lg"
        >
          <div className="p-6">
            <h2 className="mb-4 font-semibold text-gray-900 text-lg">
              <Translate content="Order Items" />
            </h2>
            {/* Products */}
            {orderProducts && orderProducts.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 font-medium text-gray-700 text-md">
                  <Translate content="Products" />
                </h3>
                <div className="space-y-4">
                  {orderProducts.map(
                    ({ product, count, price }, index) =>
                      product && (
                        <div
                          key={index}
                          className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg"
                        >
                          <img
                            src={product.photos?.[0]}
                            alt={product.name}
                            className="border rounded-lg w-16 h-16 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://via.placeholder.com/64x64/e5e7eb/6b7280?text=No+Image";
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="mb-1 font-medium text-gray-900">
                              {product.name}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              <Translate content="Quantity" />: {count}
                            </p>
                            {product.description && (
                              <p className="mt-1 text-gray-500 text-sm line-clamp-2">
                                {product.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatPrice(price * count)} DA
                            </p>
                            <p className="text-gray-600 text-sm">
                              {formatPrice(price)} DA{" "}
                              <Translate content="each" />
                            </p>
                          </div>
                        </div>
                      )
                  )}
                </div>
              </div>
            )}
            {/* Packs */}
            {orderPacks && orderPacks.length > 0 && (
              <div>
                <h3 className="mb-3 font-medium text-gray-700 text-md">
                  <Translate content="Packs" />
                </h3>
                <div className="space-y-4">
                  {orderPacks.map(
                    ({ pack, count, price }, index) =>
                      pack && (
                        <div
                          key={index}
                          className="flex items-center gap-4 bg-blue-50 p-4 rounded-lg"
                        >
                          <div className="flex justify-center items-center bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg w-16 h-16">
                            <Icon
                              icon={allIcons.solid.faBox}
                              iconClassName="text-2xl text-blue-600"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="mb-1 font-medium text-gray-900">
                              {pack.name}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              <Translate content="Quantity" />: {count}
                            </p>
                            <p className="mt-1 text-gray-500 text-sm">
                              {pack.products?.length || 0}{" "}
                              <Translate content="products included" />
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatPrice(price * count)} DA
                            </p>
                            <p className="text-gray-600 text-sm">
                              {formatPrice(price)} DA{" "}
                              <Translate content="each" />
                            </p>
                          </div>
                        </div>
                      )
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
        {/* Delivery Information */}
        {order.isDelivery && order.place && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white shadow-md mb-6 border border-gray-200 rounded-lg"
          >
            <div className="p-6">
              <h2 className="mb-4 font-semibold text-gray-900 text-lg">
                <Translate content="Delivery Information" />
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon
                    icon={allIcons.solid.faMapMarkerAlt}
                    iconClassName="text-gray-600 text-lg mt-0.5"
                  />
                  <div>
                    <h3 className="mb-1 font-medium text-gray-900">
                      <Translate content="Delivery Address" />
                    </h3>
                    <p className="text-gray-700">{order.place.address}</p>
                    <p className="text-gray-600 text-sm">
                      {order.place.wilaya}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {/* Order Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white shadow-md border border-gray-200 rounded-lg"
        >
          <div className="p-6">
            <h2 className="mb-4 font-semibold text-gray-900 text-lg">
              <Translate content="Order Actions" />
            </h2>
            <div className="flex sm:flex-row flex-col gap-3">
              <button
                onClick={() => history.push("/orders")}
                className="flex-1 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-md font-medium text-gray-700 transition-colors duration-200"
              >
                <Icon icon={allIcons.solid.faArrowLeft} iconClassName="mr-2" />
                <Translate content="Back to Orders" />
              </button>
              {order.status === "completed" && (
                <button
                  onClick={() => {
                    showToast("Reorder functionality coming soon!", "info");
                  }}
                  className="flex-1 px-4 py-3 rounded-md font-medium text-white transition-colors duration-200"
                  style={{ backgroundColor: BRAND_COLOR_PRIMARY }}
                >
                  <Icon icon={allIcons.solid.faRedo} iconClassName="mr-2" />
                  <Translate content="Reorder Items" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
