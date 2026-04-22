import { fmtShort } from "@/lib/format";

type Props = {
  onPick: (n: number) => void;
  items: number[];
};

export function QuickAmt({ onPick, items }: Props) {
  return (
    <div
      className="flex"
      style={{ gap: 6, marginTop: -6, marginBottom: 6 }}
    >
      {items.map((n) => (
        <button
          key={n}
          onClick={() => onPick(n)}
          style={{
            flex: 1,
            height: 36,
            border: "none",
            borderRadius: 10,
            background: "#F2F4F6",
            color: "#4E5968",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          +{fmtShort(n)}
        </button>
      ))}
    </div>
  );
}
