// Shared, minimal icon-only button. Reused across TaskCard / TaskDialog / lists.
export function IconButton({ children, onClick, testid, danger = false, title }) {
  const tone = danger
    ? "text-[#71717A] hover:text-[#FF3366]"
    : "text-[#71717A] hover:text-[#F2F2F2]";
  return (
    <button
      type="button"
      data-testid={testid}
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-[#121214] transition-colors ${tone}`}
    >
      {children}
    </button>
  );
}
