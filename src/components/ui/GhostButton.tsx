import type { CSSProperties, ReactNode } from "react";

type Props = {
  onClick: () => void;
  children: ReactNode;
  style?: CSSProperties;
};

export function GhostButton({ onClick, children, style }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 44,
        padding: "0 16px",
        border: "none",
        borderRadius: 12,
        background: "#F2F4F6",
        color: "#4E5968",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
