import { useEffect, useRef, useState } from "react";
import { TossAds } from "@apps-in-toss/web-framework";
import { BANNER_AD_GROUP_ID, isInToss } from "@/lib/ads";

// 토스 인앱 전용 배너. 웹에선 null 반환 → 레이아웃에 영향 없음.
// Fill 실패/렌더 실패 시 알아서 height 0으로 접힘.
export function BannerAd() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isInToss()) return;
    const el = ref.current;
    if (!el) return;

    let attached: { destroy: () => void } | null = null;
    try {
      attached = TossAds.attachBanner(BANNER_AD_GROUP_ID, el, {
        theme: "auto",
        tone: "blackAndWhite",
        variant: "expanded",
        callbacks: {
          onAdRendered: () => setVisible(true),
          onNoFill: () => setVisible(false),
          onAdFailedToRender: () => setVisible(false),
        },
      });
    } catch {
      // noop
    }

    return () => {
      try {
        attached?.destroy();
      } catch {
        // noop
      }
    };
  }, []);

  if (!isInToss()) return null;
  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: visible ? 96 : 0,
        background: "transparent",
        transition: "height 160ms ease",
        overflow: "hidden",
        flexShrink: 0,
      }}
    />
  );
}
