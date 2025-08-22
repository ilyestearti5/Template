import { allIcons } from "@biqpod/app/ui/apis";
import { Icon, Translate } from "@biqpod/app/ui/components";
import { tw } from "@biqpod/app/ui/utils";
import { useHistory } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isTranslatable?: boolean;
  hoverColor?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

/**
 * Reusable Breadcrumb Component
 *
 * Usage Examples:
 *
 * 1. Simple page breadcrumb:
 * <Breadcrumb items={[{ label: "Search Results", isTranslatable: true }]} />
 *
 * 2. Collection page with dynamic name:
 * <Breadcrumb items={[{
 *   label: collection?.name || "Collection",
 *   isTranslatable: !collection?.name
 * }]} />
 *
 * 3. Complex nested navigation:
 * <Breadcrumb items={[
 *   { label: "Categories", onClick: () => navigate("/categories"), isTranslatable: true },
 *   { label: "Electronics", onClick: () => navigate("/categories/electronics") },
 *   { label: "Smartphones" }
 * ]} />
 *
 * 4. Without Home button:
 * <Breadcrumb items={[...]} showHome={false} />
 *
 * 5. Custom styling:
 * <Breadcrumb items={[...]} className="bg-white !border-none" />
 */
export const Breadcrumb = ({
  items,
  className = "",
  showHome = true,
}: BreadcrumbProps) => {
  const history = useHistory();

  // Default Home item
  const defaultHomeItem: BreadcrumbItem = {
    label: "Home",
    onClick: () => history.push("/"),
    isTranslatable: true,
    hoverColor: "hover:text-sky-600",
  };

  // Build breadcrumb items based on showHome prop
  const breadcrumbItems = showHome
    ? items.length === 0 || items[0].label !== "Home"
      ? [defaultHomeItem, ...items]
      : items
    : items;

  return (
    <div className={tw("bg-gray-50 py-3 border-gray-200 border-b", className)}>
      <div className="mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          {breadcrumbItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {/* Breadcrumb Item */}
              {item.onClick ? (
                <a
                  onClick={item.onClick}
                  className={`${
                    item.hoverColor || "hover:text-sky-600"
                  } transition-colors cursor-pointer`}
                >
                  {item.isTranslatable ? (
                    <Translate content={item.label} />
                  ) : (
                    item.label
                  )}
                </a>
              ) : (
                <span
                  className={`font-medium ${
                    index === breadcrumbItems.length - 1
                      ? "text-gray-900"
                      : "text-gray-600"
                  }`}
                >
                  {item.isTranslatable ? (
                    <Translate content={item.label} />
                  ) : (
                    item.label
                  )}
                </span>
              )}

              {/* Separator - don't show after last item */}
              {index < breadcrumbItems.length - 1 && (
                <Icon
                  icon={allIcons.solid.faChevronRight}
                  iconClassName="text-xs"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
