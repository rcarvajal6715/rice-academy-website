export function Button({ children, className = "", variant = "default", ...props }) {
  const baseStyles = "px-3 py-2 rounded text-sm font-medium transition";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 text-gray-800 hover:bg-gray-100",
  };

  const variantClass = variants[variant] || variants.default;

  return (
    <button className={`${baseStyles} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}