import { useEffect, useMemo, useRef } from "react";
import { TossAds } from "@apps-in-toss/web-framework";
import { BANNER_AD_GROUP_ID, isBannerSupported } from "@/lib/ads";

// pet 프로젝트 패턴 그대로:
//  - 컴포넌트 내부에서 TossAds.initialize 한 번
//  - 컨테이너는 처음부터 96px 고정 (높이 0이면 attachBanner 실패함)
//  - 비지원 환경(웹/구버전 토스)에서는 null 반환
export function BannerAd() {
  const ref = useRef<HTMLDivElement>(null);
  const supported = useMemo(() => isBannerSupported(), []);

  useEffect(() => {
    if (!supported) return;
    let attached: { destroy: () => void } | null = null;

    try {
      TossAds.initialize({
        callbacks: {
          onInitialized: () => {
            if (!ref.current) return;
            try {
              attached = TossAds.attachBanner(
                BANNER_AD_GROUP_ID,
                ref.current,
                { theme: "auto", variant: "expanded" },
              );
            } catch {
              // attach 실패는 조용히 무시 (NoFill/네트워크 이슈 등)
            }
          },
          onInitializationFailed: () => {},
        },
      });
    } catch {
      // initialize 실패도 무시
    }

    return () => {
      try {
        attached?.destroy();
      } catch {
        // noop
      }
    };
  }, [supported]);

  if (!supported) return null;
  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: 96,
        flexShrink: 0,
      }}
    />
  );
}
