type Props = {
  onMenu: () => void;
};

export function TopBar({ onMenu }: Props) {
  return (
    <div
      className="flex items-center justify-between px-5"
      style={{
        paddingTop: "max(14px, env(safe-area-inset-top))",
        paddingBottom: 10,
        background: "var(--bg)",
      }}
    >
      <div
        className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: "#191F28",
          letterSpacing: -0.5,
          minWidth: 0,
          flex: "0 1 auto",
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "var(--pc)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path
              d="M3 8l3 3 7-7"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        중도금 선납 계산기
      </div>
      <button
        onClick={onMenu}
        className="flex items-center justify-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          border: "none",
          background: "#F2F4F6",
          cursor: "pointer",
        }}
        aria-label="메뉴"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <circle cx="4" cy="9" r="1.6" fill="#4E5968" />
          <circle cx="9" cy="9" r="1.6" fill="#4E5968" />
          <circle cx="14" cy="9" r="1.6" fill="#4E5968" />
        </svg>
      </button>
    </div>
  );
}
