// Custom Button Component
export const Button = ({
  children,
  className,
  style,
  onClick,
  ...props
}: any) => (
  <button
    className={`px-4 py-2 font-medium transition-all duration-200 ${
      className || ""
    }`}
    style={style}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);
// Custom Line Component
export const Line = () => <hr className="bg-gray-300 h-[1px]" />;
