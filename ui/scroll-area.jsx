export function ScrollArea({ children, className = "" }) {
  return (
    <div className={`scroll-area ${className}`} style={{ overflowY: "auto", maxHeight: "300px" }}>
      {children}
    </div>
  );
}