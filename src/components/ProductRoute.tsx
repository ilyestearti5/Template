import React from "react";

export interface ProductRouteProps {
  children?: React.ReactNode;
  productName?: string;
  productId?: string;
  price?: number;
  currency?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ProductRoute: React.FC<ProductRouteProps> = ({
  children,
  productName,
  productId,
  price,
  currency = "USD",
  className = "",
  style = {},
}) => {
  const containerStyle: React.CSSProperties = {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    padding: "20px",
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
  };

  const titleStyle: React.CSSProperties = {
    margin: "0",
    fontSize: "24px",
    fontWeight: "700",
    color: "#333333",
  };

  const metaStyle: React.CSSProperties = {
    margin: "5px 0 0 0",
    fontSize: "14px",
    color: "#666666",
  };

  const priceStyle: React.CSSProperties = {
    margin: "10px 0 0 0",
    fontSize: "20px",
    fontWeight: "600",
    color: "#007bff",
  };

  return (
    <div style={containerStyle} className={className}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>{productName || "Product"}</h1>
        {productId && <p style={metaStyle}>Product ID: {productId}</p>}
        {price !== undefined && (
          <p style={priceStyle}>
            {price.toFixed(2)} {currency}
          </p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
};
