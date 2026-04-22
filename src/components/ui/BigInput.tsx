import type { CSSProperties, HTMLInputTypeAttribute } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  inputMode?:
    | "numeric"
    | "decimal"
    | "text"
    | "tel"
    | "search"
    | "email"
    | "url"
    | "none";
  suffix?: string;
  style?: CSSProperties;
};

export function BigInput({
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  suffix,
  style,
}: Props) {
  return (
    <div
      className="flex items-center"
      style={{
        background: "#F2F4F6",
        borderRadius: 14,
        padding: "0 16px",
        height: 54,
        ...style,
      }}
    >
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-none bg-transparent outline-none"
        style={{
          fontSize: 17,
          fontWeight: 500,
          color: "#191F28",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: -0.3,
        }}
      />
      {suffix && (
        <span
          className="ml-2 flex-shrink-0"
          style={{
            fontSize: 15,
            color: "#8B95A1",
            fontWeight: 500,
          }}
        >
          {suffix}
        </span>
      )}
    </div>
  );
}
