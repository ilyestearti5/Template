import React from "react";

export interface StoreRouteProps {
  children?: React.ReactNode;
  storeName?: string;
  storeId?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const StoreRoute: React.FC<StoreRouteProps> = ({
  children,
  storeName,
  storeId,
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

  const idStyle: React.CSSProperties = {
    margin: "5px 0 0 0",
    fontSize: "14px",
    color: "#666666",
  };

  return (
    <div style={containerStyle} className={className}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>{storeName || "Store"}</h1>
        {storeId && <p style={idStyle}>Store ID: {storeId}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
};
