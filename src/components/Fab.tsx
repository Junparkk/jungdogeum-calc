type Props = {
  onClick: () => void;
  bottomOffset?: number;
};

export function Fab({ onClick, bottomOffset = 0 }: Props) {
  return (
    <button
      onClick={onClick}
      className="absolute z-50 flex items-center justify-center"
      style={{
        bottom: 24 + bottomOffset,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 999,
        border: "none",
        background: "var(--pc)",
        color: "#fff",
        cursor: "pointer",
        boxShadow:
          "0 8px 20px var(--pc-shadow), 0 2px 6px rgba(0,0,0,0.12)",
      }}
      aria-label="납부 추가"
    >
      <svg width="22" height="22" viewBox="0 0 22 22">
        <path
          d="M11 4v14M4 11h14"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
