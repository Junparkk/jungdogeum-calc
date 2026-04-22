import type { ReactNode } from "react";

type Props = {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function Field({ label, hint, error, children }: Props) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "#4E5968",
          marginBottom: 6,
          letterSpacing: -0.2,
        }}
      >
        {label}
      </div>
      {children}
      {hint && !error && (
        <div style={{ fontSize: 12, color: "#8B95A1", marginTop: 6 }}>
          {hint}
        </div>
      )}
      {error && (
        <div style={{ fontSize: 12, color: "#FF4D4F", marginTop: 6 }}>
          {error}
        </div>
      )}
    </div>
  );
}
