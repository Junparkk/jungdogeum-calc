import { useEffect, useState, type ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function BottomSheet({ open, onClose, title, children }: Props) {
  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const r1 = requestAnimationFrame(() => {
        const r2 = requestAnimationFrame(() => setEntered(true));
        return () => cancelAnimationFrame(r2);
      });
      return () => cancelAnimationFrame(r1);
    } else {
      setEntered(false);
      const t = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className="absolute inset-0 z-[100]"
      style={{ pointerEvents: open ? "auto" : "none" }}
    >
      <div
        onClick={onClose}
        className="absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.38)",
          opacity: entered ? 1 : 0,
          transition: "opacity 260ms ease",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col bg-white"
        style={{
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: "88%",
          transform: entered ? "translateY(0)" : "translateY(100%)",
          transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: "0 -8px 30px rgba(0,0,0,0.12)",
        }}
      >
        <div className="flex justify-center pb-1 pt-2.5">
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 999,
              background: "#E5E8EB",
            }}
          />
        </div>
        <div className="flex items-center justify-between px-5 pb-2 pt-2.5">
          <div
            className="font-bold"
            style={{ fontSize: 18, color: "#191F28", letterSpacing: -0.4 }}
          >
            {title}
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              border: "none",
              background: "#F2F4F6",
              color: "#4E5968",
              fontSize: 16,
              cursor: "pointer",
            }}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div
          className="overflow-y-auto px-5 pt-2"
          style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
