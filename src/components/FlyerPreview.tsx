"use client";

import { useEffect, useRef, useState } from "react";
import Flyer, { FLYER_HEIGHT, FLYER_WIDTH, type FlyerData } from "./Flyer";

export default function FlyerPreview({ data }: { data: FlyerData }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setScale(el.getBoundingClientRect().width / FLYER_WIDTH);
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        maxWidth: "100%",
        contain: "layout",
        minHeight: scale === 0 ? 200 : undefined,
      }}
    >
      {scale > 0 && (
        <>
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width: FLYER_WIDTH,
              height: FLYER_HEIGHT,
              pointerEvents: "none",
            }}
          >
            <Flyer data={data} />
          </div>
          <div style={{ height: FLYER_HEIGHT * scale, marginTop: -FLYER_HEIGHT }} />
        </>
      )}
    </div>
  );
}