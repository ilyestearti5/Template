import { allIcons } from "@biqpod/app/ui/apis";
import { Icon, Translate } from "@biqpod/app/ui/components";
import { useAsyncMemo, showToast } from "@biqpod/app/ui/hooks";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useHistory } from "react-router";
import { api } from "../api";
import { BRAND_COLOR_PRIMARY } from "./utils";

interface OrderCardProps {
  order: SnapBuy.Order;
}

// Utility functions
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-DZ").format(price);
};

const getOrderStatusColor = (status: SnapBuy.OrderStatus): string => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "delivery":
      return "bg-purple-100 text-purple-800";
    case "completed":
    case "done":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getOrderStatusIcon = (status: SnapBuy.OrderStatus) => {
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

export const OrderCard = ({ order }: OrderCardProps) => {
  const history = useHistory();

  // Fetch products data for the order
  const orderProducts = useAsyncMemo(async () => {
    if (!order.products) return [];

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
  }, [order.products]);

  // Fetch packs data for the order
  const orderPacks = useAsyncMemo(async () => {
    if (!order.packs) return [];

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
  }, [order.packs]);

  const orderDate = useMemo(() => {
    if (order.createdAt) {
      return new Date(order.createdAt).toLocaleDateString();
    }
    return "Unknown";
  }, [order.createdAt]);

  const totalItems = useMemo(() => {
    const productCount = Object.values(order.products || {}).reduce(
      (sum, item) => sum + (item?.count || 0),
      0
    );
    const packCount = Object.values(order.packs || {}).reduce(
      (sum, item) => sum + (item?.count || 0),
      0
    );
    return productCount + packCount;
  }, [order.products, order.packs]);

  const statusColor = getOrderStatusColor(order.status);
  const statusIcon = getOrderStatusIcon(order.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg overflow-hidden transition-shadow duration-200"
    >
      {/* Order Header */}
      <div className="p-4 border-gray-100 border-b">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              <Translate content="Order" /> #{order.id?.slice(-8)}
            </h3>
            <p className="text-gray-600 text-sm">{orderDate}</p>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
          >
            <Icon icon={statusIcon} iconClassName="text-sm" />
            <span className="capitalize">
              <Translate content={order.status} />
            </span>
          </div>
        </div>

        {/* Order Info */}
        <div className="flex justify-between items-center text-gray-600 text-sm">
          <span>
            {totalItems} <Translate content="items" />
          </span>
          <span className="font-semibold text-gray-900 text-lg">
            {formatPrice(order.totalPrice || 0)} DA
          </span>
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="p-4">
        {/* Products */}
        {orderProducts && orderProducts.length > 0 && (
          <div className="mb-3">
            <h4 className="mb-2 font-medium text-gray-700 text-sm">
              <Translate content="Products" />:
            </h4>
            <div className="space-y-2">
              {orderProducts.slice(0, 2).map(
                ({ product, count, price }, index) =>
                  product && (
                    <div key={index} className="flex items-center gap-3">
                      <img
                        src={product.photos?.[0]}
                        alt={product.name}
                        className="border rounded-md w-12 h-12 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://via.placeholder.com/48x48/e5e7eb/6b7280?text=No+Image";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {product.name}
                        </p>
                        <p className="text-gray-600 text-xs">
                          <Translate content="Qty" />: {count} ×{" "}
                          {formatPrice(price)} DA
                        </p>
                      </div>
                    </div>
                  )
              )}
              {orderProducts.length > 2 && (
                <p className="mt-1 text-gray-500 text-xs">
                  +{orderProducts.length - 2} <Translate content="more items" />
                </p>
              )}
            </div>
          </div>
        )}

        {/* Packs */}
        {orderPacks && orderPacks.length > 0 && (
          <div className="mb-3">
            <h4 className="mb-2 font-medium text-gray-700 text-sm">
              <Translate content="Packs" />:
            </h4>
            <div className="space-y-2">
              {orderPacks.map(
                ({ pack, count, price }, index) =>
                  pack && (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex justify-center items-center bg-gradient-to-br from-blue-100 to-blue-200 rounded-md w-12 h-12">
                        <Icon
                          icon={allIcons.solid.faBox}
                          iconClassName="text-blue-600"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {pack.name}
                        </p>
                        <p className="text-gray-600 text-xs">
                          <Translate content="Qty" />: {count} ×{" "}
                          {formatPrice(price)} DA
                        </p>
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        {/* Delivery Info */}
        {order.isDelivery && order.place && (
          <div className="bg-gray-50 mt-3 p-3 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <Icon
                icon={allIcons.solid.faMapMarkerAlt}
                iconClassName="text-gray-600"
              />
              <span className="font-medium text-gray-700 text-sm">
                <Translate content="Delivery Address" />
              </span>
            </div>
            <p className="ml-5 text-gray-600 text-sm">
              {order.place.address}, {order.place.wilaya}
            </p>
          </div>
        )}
      </div>

      {/* Order Actions */}
      <div className="bg-gray-50 p-4 border-gray-100 border-t">
        <div className="flex gap-2">
          <button
            onClick={() => history.push(`/order/${order.id}`)}
            className="flex-1 bg-white hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 text-sm transition-colors duration-200"
          >
            <Translate content="View Details" />
          </button>

          {order.status === "completed" && (
            <button
              onClick={() => {
                // Handle reorder functionality
                showToast("Reorder functionality coming soon!", "info");
              }}
              className="flex-1 px-4 py-2 rounded-md font-medium text-white text-sm transition-colors duration-200"
              style={{ backgroundColor: BRAND_COLOR_PRIMARY }}
            >
              <Translate content="Reorder" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
