"use client";

import React, { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdsenseHorizontal() {
  // Get AdSense config from environment variables
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT || "";
  const adSrc =process.env.NEXT_PUBLIC_ADSENSE_SRC;

  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // Ignore if AdSense is blocked
    }
  }, []);

  return (
    <>
      <script
        async
        src={`${adSrc}?client=${adClient}`}
        crossOrigin="anonymous"
      ></script>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </>
  );
}
