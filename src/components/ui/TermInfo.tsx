import { useEffect, useRef, useState } from "react";

type Props = {
  desc: string;
};

// 용어 옆에 작은 ⓘ 버튼. 누르면 그 자리 위에 작은 설명 풍선이 뜨고
// 바깥을 누르면 닫힘.
export function TermInfo({ desc }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: Event) => {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, [open]);

  return (
    <span
      ref={wrapRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        style={{
          width: 16,
          height: 16,
          marginLeft: 4,
          padding: 0,
          borderRadius: 999,
          border: "1px solid #D1D6DB",
          background: open ? "#191F28" : "#fff",
          color: open ? "#fff" : "#8B95A1",
          fontSize: 10,
          fontWeight: 700,
          cursor: "pointer",
          lineHeight: 1,
          verticalAlign: "middle",
        }}
        aria-label="설명 보기"
      >
        i
      </button>
      {open && (
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            right: -8,
            zIndex: 50,
            width: 220,
            padding: "10px 12px",
            borderRadius: 10,
            background: "#191F28",
            color: "#fff",
            fontSize: 12,
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: -0.1,
            boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
          }}
        >
          {desc}
        </span>
      )}
    </span>
  );
}
