import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { a as Route } from "./router-xq-IyoU4.js";
import "zod";
import "@netlify/blobs";
import "../server.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
function GalleryPage() {
  const {
    galleryId
  } = Route.useParams();
  const galleryUrl = typeof window !== "undefined" ? window.location.href : "";
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadedImages, setLoadedImages] = useState(/* @__PURE__ */ new Set());
  const [errorImages, setErrorImages] = useState(/* @__PURE__ */ new Set());
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch(`/api/gallery/${galleryId}`);
        if (res.status === 410) {
          setExpired(true);
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setError("Gallery not found");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setGallery(data);
      } catch {
        setError("Failed to load gallery");
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [galleryId]);
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(galleryUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
    }
  };
  const handleImageLoad = (imageId) => {
    setLoadedImages((prev) => new Set(prev).add(imageId));
  };
  const handleImageError = (imageId) => {
    setErrorImages((prev) => new Set(prev).add(imageId));
    setLoadedImages((prev) => new Set(prev).add(imageId));
  };
  const formatExpiry = (dateStr) => {
    const date = new Date(dateStr);
    const now = /* @__PURE__ */ new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1e3 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    const minutes = Math.floor(diff / (1e3 * 60));
    if (minutes > 0) return `${minutes}m remaining`;
    return "Expiring soon";
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative min-h-screen flex flex-col items-center justify-start px-4 py-10", children: [
    /* @__PURE__ */ jsx("div", { style: {
      position: "fixed",
      top: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "800px",
      height: "500px",
      background: "radial-gradient(ellipse at top, rgba(201,168,76,0.06) 0%, transparent 65%)",
      pointerEvents: "none",
      zIndex: 0
    } }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 w-full max-w-4xl fade-up", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsx(Link, { to: "/", style: {
          textDecoration: "none"
        }, children: /* @__PURE__ */ jsx("h1", { className: "gold-gradient", style: {
          fontSize: "2rem",
          fontWeight: 700,
          margin: 0,
          letterSpacing: "-0.03em"
        }, children: "ImgUl" }) }),
        /* @__PURE__ */ jsx("p", { style: {
          color: "var(--text-muted)",
          fontSize: "0.72rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginTop: "0.3rem"
        }, children: "Gallery" })
      ] }),
      loading && /* @__PURE__ */ jsxs("div", { className: "glass-card", style: {
        borderRadius: "16px",
        padding: "4rem 2rem",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem"
      }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          width: "32px",
          height: "32px",
          border: "2px solid rgba(201,168,76,0.3)",
          borderTopColor: "var(--gold)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        } }),
        /* @__PURE__ */ jsx("p", { style: {
          color: "var(--text-muted)",
          fontSize: "0.8rem",
          letterSpacing: "0.1em",
          margin: 0
        }, children: "Loading gallery…" })
      ] }),
      !loading && error && /* @__PURE__ */ jsxs("div", { className: "glass-card", style: {
        borderRadius: "16px",
        padding: "4rem 2rem",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        textAlign: "center"
      }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: "2.5rem",
          marginBottom: "1rem",
          opacity: 0.4
        }, children: "⚠" }),
        /* @__PURE__ */ jsx("h2", { style: {
          color: "var(--text)",
          fontSize: "1.3rem",
          fontWeight: 600,
          margin: "0 0 0.5rem",
          fontFamily: "'Playfair Display', Georgia, serif"
        }, children: "Gallery Not Found" }),
        /* @__PURE__ */ jsx("p", { style: {
          color: "var(--text-muted)",
          fontSize: "0.85rem",
          margin: "0 0 1.5rem"
        }, children: error }),
        /* @__PURE__ */ jsx(Link, { to: "/", style: {
          textDecoration: "none"
        }, children: /* @__PURE__ */ jsx("button", { className: "btn-gold", style: {
          padding: "0.75rem 2rem",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontSize: "0.82rem"
        }, children: "Go Home" }) })
      ] }),
      !loading && expired && /* @__PURE__ */ jsxs("div", { className: "glass-card", style: {
        borderRadius: "16px",
        padding: "4rem 2rem",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        textAlign: "center"
      }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: "2.5rem",
          marginBottom: "1rem",
          opacity: 0.4
        }, children: "⏳" }),
        /* @__PURE__ */ jsx("h2", { style: {
          color: "var(--text)",
          fontSize: "1.3rem",
          fontWeight: 600,
          margin: "0 0 0.5rem",
          fontFamily: "'Playfair Display', Georgia, serif"
        }, children: "Gallery Expired" }),
        /* @__PURE__ */ jsx("p", { style: {
          color: "var(--text-muted)",
          fontSize: "0.85rem",
          margin: "0 0 1.5rem"
        }, children: "This gallery is no longer available." }),
        /* @__PURE__ */ jsx(Link, { to: "/", style: {
          textDecoration: "none"
        }, children: /* @__PURE__ */ jsx("button", { className: "btn-gold", style: {
          padding: "0.75rem 2rem",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontSize: "0.82rem"
        }, children: "Go Home" }) })
      ] }),
      !loading && !error && !expired && gallery && /* @__PURE__ */ jsxs("div", { className: "glass-card", style: {
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7)"
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: {
          padding: "1.25rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          borderBottom: "1px solid var(--border)"
        }, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", style: {
            flexWrap: "wrap"
          }, children: [
            /* @__PURE__ */ jsxs("span", { style: {
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.3rem 0.7rem",
              background: "rgba(201,168,76,0.1)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: "var(--gold-light)",
              fontSize: "0.72rem",
              letterSpacing: "0.05em",
              fontWeight: 500
            }, children: [
              /* @__PURE__ */ jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
                /* @__PURE__ */ jsx("circle", { cx: "8.5", cy: "8.5", r: "1.5" }),
                /* @__PURE__ */ jsx("polyline", { points: "21 15 16 10 5 21" })
              ] }),
              gallery.imageIds.length,
              " ",
              gallery.imageIds.length === 1 ? "image" : "images"
            ] }),
            gallery.expiresAt && /* @__PURE__ */ jsxs("span", { style: {
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.3rem 0.7rem",
              background: "rgba(220,180,80,0.08)",
              border: "1px solid rgba(220,180,80,0.2)",
              borderRadius: "6px",
              color: "var(--text-muted)",
              fontSize: "0.72rem",
              letterSpacing: "0.05em"
            }, children: [
              /* @__PURE__ */ jsxs("svg", { width: "11", height: "11", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
                /* @__PURE__ */ jsx("polyline", { points: "12 6 12 12 16 14" })
              ] }),
              formatExpiry(gallery.expiresAt)
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: copyToClipboard, style: {
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.45rem 0.85rem",
            background: copied ? "rgba(201,168,76,0.15)" : "transparent",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: copied ? "var(--gold)" : "var(--text-muted)",
            fontSize: "0.7rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s ease"
          }, children: copied ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "var(--gold)", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("polyline", { points: "20 6 9 17 4 12" }) }),
            "Copied"
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }),
              /* @__PURE__ */ jsx("path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" })
            ] }),
            "Copy Link"
          ] }) })
        ] }),
        /* @__PURE__ */ jsx("div", { style: {
          padding: "1.5rem"
        }, children: /* @__PURE__ */ jsx("div", { className: "grid gap-4", style: {
          gridTemplateColumns: "repeat(2, 1fr)"
        }, children: gallery.imageIds.map((imageId) => /* @__PURE__ */ jsx(Link, { to: "/view/$imageId", params: {
          imageId
        }, style: {
          textDecoration: "none",
          display: "block"
        }, children: /* @__PURE__ */ jsxs("div", { style: {
          position: "relative",
          aspectRatio: "4 / 3",
          borderRadius: "10px",
          overflow: "hidden",
          background: "rgba(0,0,0,0.4)",
          border: "1px solid transparent",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          cursor: "pointer"
        }, onMouseEnter: (e) => {
          const el = e.currentTarget;
          el.style.transform = "scale(1.02)";
          el.style.border = "1px solid var(--border)";
          el.style.boxShadow = "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.1)";
        }, onMouseLeave: (e) => {
          const el = e.currentTarget;
          el.style.transform = "scale(1)";
          el.style.border = "1px solid transparent";
          el.style.boxShadow = "none";
        }, children: [
          !loadedImages.has(imageId) && /* @__PURE__ */ jsx("div", { style: {
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            zIndex: 2
          }, children: /* @__PURE__ */ jsx("div", { style: {
            width: "22px",
            height: "22px",
            border: "2px solid rgba(201,168,76,0.3)",
            borderTopColor: "var(--gold)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          } }) }),
          errorImages.has(imageId) && /* @__PURE__ */ jsxs("div", { style: {
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
            zIndex: 2
          }, children: [
            /* @__PURE__ */ jsx("span", { style: {
              fontSize: "1.2rem",
              opacity: 0.4
            }, children: "⚠" }),
            /* @__PURE__ */ jsx("span", { style: {
              fontSize: "0.65rem",
              color: "var(--text-muted)",
              letterSpacing: "0.1em"
            }, children: "Unavailable" })
          ] }),
          /* @__PURE__ */ jsx("img", { src: `/api/image/${imageId}`, alt: "Gallery image", onLoad: () => handleImageLoad(imageId), onError: () => handleImageError(imageId), style: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: errorImages.has(imageId) ? "none" : "block",
            opacity: loadedImages.has(imageId) ? 1 : 0,
            transition: "opacity 0.4s ease"
          } })
        ] }) }, imageId)) }) }),
        /* @__PURE__ */ jsxs("div", { style: {
          padding: "0 1.5rem 1.5rem"
        }, children: [
          /* @__PURE__ */ jsx("div", { style: {
            height: "1px",
            background: "var(--border)",
            marginBottom: "1.25rem"
          } }),
          /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            gap: "0.75rem"
          }, children: [
            /* @__PURE__ */ jsx(Link, { to: "/", style: {
              flex: 1,
              textDecoration: "none"
            }, children: /* @__PURE__ */ jsxs("button", { className: "btn-ghost", style: {
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }, children: [
              /* @__PURE__ */ jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                /* @__PURE__ */ jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                /* @__PURE__ */ jsx("polyline", { points: "17 8 12 3 7 8" }),
                /* @__PURE__ */ jsx("line", { x1: "12", y1: "3", x2: "12", y2: "15" })
              ] }),
              "Upload New"
            ] }) }),
            /* @__PURE__ */ jsxs("button", { onClick: copyToClipboard, className: "btn-gold", style: {
              flex: 1,
              padding: "0.75rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }, children: [
              /* @__PURE__ */ jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ jsx("path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }),
                /* @__PURE__ */ jsx("path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" })
              ] }),
              copied ? "✓ Link Copied" : "Share Gallery"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { style: {
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "0.68rem",
        letterSpacing: "0.08em",
        marginTop: "2rem"
      }, children: "IMGUL · IMAGE GALLERY" })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 768px) {
          .grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      ` })
  ] });
}
export {
  GalleryPage as component
};
