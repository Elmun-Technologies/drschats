"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { analyticsIdsFromEnvironment, sanitizeAnalyticsIds, type AnalyticsIds } from "@/lib/analytics/config";

/*
  Analytics IDs may be set in the deployment environment or managed at runtime
  in /admin/integrations. The endpoint returns public IDs only; the browser
  validates their provider-specific shape before loading any vendor script.
*/
declare global {
  interface Window {
    __GOVITA_ANALYTICS__?: AnalyticsIds;
  }
}

const BUILD_IDS = analyticsIdsFromEnvironment();

export function Analytics() {
  const [ids, setIds] = useState<AnalyticsIds>(BUILD_IDS);
  const [webvisor, setWebvisor] = useState(true);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/public/analytics", { cache: "no-store", credentials: "same-origin" })
      .then((response) => response.ok ? response.json() : null)
      .then((value) => {
        if (!active) return;
        if (value && typeof value === "object") {
          setIds(sanitizeAnalyticsIds(value as Partial<Record<keyof AnalyticsIds, unknown>>));
          setWebvisor((value as { webvisor?: unknown }).webvisor !== false);
        }
        setResolved(true);
      })
      .catch(() => {
        if (active) setResolved(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (resolved) window.__GOVITA_ANALYTICS__ = ids;
  }, [ids, resolved]);

  if (!resolved) return null;
  const { gtm, ga4, metaPixel: pixel, yandexMetrika: ym } = ids;

  return (
    <>
      {gtm && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}

      {ga4 && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4)}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`}
          </Script>
        </>
      )}

      {pixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      )}

      {ym && (
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(${ym},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:${webvisor ? "true" : "false"}});`}
        </Script>
      )}
    </>
  );
}
