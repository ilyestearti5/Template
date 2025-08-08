import React from "react";

export interface CollectionRouteProps {
  children?: React.ReactNode;
  collectionName?: string;
  collectionId?: string;
  itemCount?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CollectionRoute: React.FC<CollectionRouteProps> = ({
  children,
  collectionName,
  collectionId,
  itemCount,
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

  const countStyle: React.CSSProperties = {
    margin: "10px 0 0 0",
    fontSize: "16px",
    fontWeight: "500",
    color: "#007bff",
  };

  return (
    <div style={containerStyle} className={className}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>{collectionName || "Collection"}</h1>
        {collectionId && <p style={metaStyle}>Collection ID: {collectionId}</p>}
        {itemCount !== undefined && (
          <p style={countStyle}>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
};
