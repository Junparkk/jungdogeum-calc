import type { CSSProperties, ReactNode } from "react";

type Props = {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  style?: CSSProperties;
};

export function PrimaryButton({
  onClick,
  children,
  disabled,
  style,
}: Props) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        width: "100%",
        height: 56,
        border: "none",
        borderRadius: 14,
        background: disabled ? "#E5E8EB" : "var(--pc, #3182F6)",
        color: disabled ? "#B0B8C1" : "#fff",
        fontSize: 17,
        fontWeight: 700,
        letterSpacing: -0.3,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 140ms",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
