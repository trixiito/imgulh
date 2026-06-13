import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { R as Route } from "./router-BgarmacZ.js";
import "zod";
import "@netlify/blobs";
function ViewPage() {
  const {
    imageId
  } = Route.useParams();
  const imageUrl = `/api/image/${imageId}`;
  const viewUrl = typeof window !== "undefined" ? window.location.href : "";
  const [copied, setCopied] = useState(false);
  const [copiedDirect, setCopiedDirect] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [autoCopied, setAutoCopied] = useState(false);
  const imgRef = useRef(null);
  const {
    expiresAt
  } = Route.useSearch();
  const [timeLeft, setTimeLeft] = useState(null);
  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const hours = Math.floor(diff / (1e3 * 60 * 60));
      const minutes = Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60));
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };
    update();
    const interval = setInterval(update, 6e4);
    return () => clearInterval(interval);
  }, [expiresAt]);
  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const directUrl = `${window.location.origin}/api/image/${imageId}`;
    navigator.clipboard.writeText(directUrl).then(() => {
      setAutoCopied(true);
      setTimeout(() => setAutoCopied(false), 3e3);
    }).catch(() => {
    });
  }, [imageId]);
  const copyToClipboard = async (text, setCb) => {
    try {
      await navigator.clipboard.writeText(text);
      setCb(true);
      setTimeout(() => setCb(false), 2200);
    } catch {
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative min-h-screen flex flex-col items-center justify-start px-4 py-10", children: [
    autoCopied && /* @__PURE__ */ jsxs("div", { style: {
      position: "fixed",
      top: "1.5rem",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 100,
      background: "rgba(12, 12, 20, 0.92)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid var(--gold-dim)",
      borderRadius: "10px",
      padding: "0.7rem 1.25rem",
      display: "flex",
      alignItems: "center",
      gap: "0.6rem",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.1)",
      animation: "toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
    }, children: [
      /* @__PURE__ */ jsx("span", { style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "22px",
        height: "22px",
        borderRadius: "50%",
        background: "rgba(201,168,76,0.15)",
        flexShrink: 0
      }, children: /* @__PURE__ */ jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "var(--gold)", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("polyline", { points: "20 6 9 17 4 12" }) }) }),
      /* @__PURE__ */ jsx("span", { style: {
        color: "var(--text)",
        fontSize: "0.82rem",
        fontWeight: 400
      }, children: "Direct image link copied to clipboard" })
    ] }),
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
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 w-full max-w-3xl fade-up", children: [
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
        }, children: "Image Hosted" }),
        timeLeft && /* @__PURE__ */ jsxs("div", { style: {
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.35rem 0.85rem",
          borderRadius: "20px",
          background: timeLeft === "Expired" ? "rgba(220,80,80,0.12)" : "rgba(201,168,76,0.1)",
          border: `1px solid ${timeLeft === "Expired" ? "rgba(220,80,80,0.3)" : "var(--gold-dim)"}`,
          marginTop: "0.75rem",
          fontSize: "0.72rem",
          letterSpacing: "0.06em",
          color: timeLeft === "Expired" ? "#f08080" : "var(--gold-light)"
        }, children: [
          /* @__PURE__ */ jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
            /* @__PURE__ */ jsx("polyline", { points: "12 6 12 12 16 14" })
          ] }),
          timeLeft === "Expired" ? "This image has expired" : `Expires in ${timeLeft}`
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass-card", style: {
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7)"
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: {
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
          position: "relative"
        }, children: [
          !loaded && !imgError && /* @__PURE__ */ jsxs("div", { style: {
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
            color: "var(--text-muted)"
          }, children: [
            /* @__PURE__ */ jsx("div", { style: {
              width: "28px",
              height: "28px",
              border: "2px solid rgba(201,168,76,0.3)",
              borderTopColor: "var(--gold)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite"
            } }),
            /* @__PURE__ */ jsx("span", { style: {
              fontSize: "0.72rem",
              letterSpacing: "0.1em"
            }, children: "Loading…" })
          ] }),
          imgError && /* @__PURE__ */ jsxs("div", { style: {
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--text-muted)"
          }, children: [
            /* @__PURE__ */ jsx("span", { style: {
              fontSize: "1.5rem",
              opacity: 0.4
            }, children: "⚠" }),
            /* @__PURE__ */ jsx("span", { style: {
              fontSize: "0.72rem",
              letterSpacing: "0.1em"
            }, children: "Image unavailable" })
          ] }),
          /* @__PURE__ */ jsx("img", { ref: imgRef, src: imageUrl, alt: "Hosted image", onLoad: () => setLoaded(true), onError: () => {
            setLoaded(true);
            setImgError(true);
          }, style: {
            maxWidth: "100%",
            maxHeight: "70vh",
            objectFit: "contain",
            display: imgError ? "none" : "block",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.4s ease"
          } })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: {
          padding: "1.5rem"
        }, children: [
          /* @__PURE__ */ jsx("div", { style: {
            height: "1px",
            background: "var(--border)",
            marginBottom: "1.5rem"
          } }),
          /* @__PURE__ */ jsxs("div", { style: {
            marginBottom: "1rem"
          }, children: [
            /* @__PURE__ */ jsx("label", { style: {
              display: "block",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "0.5rem"
            }, children: "Page Link" }),
            /* @__PURE__ */ jsxs("div", { style: {
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              overflow: "hidden"
            }, children: [
              /* @__PURE__ */ jsx("input", { readOnly: true, value: viewUrl, style: {
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                padding: "0.65rem 0.75rem",
                color: "var(--gold-light)",
                fontSize: "0.8rem",
                fontFamily: "Menlo, Monaco, monospace",
                cursor: "text",
                minWidth: 0
              }, onClick: (e) => e.target.select() }),
              /* @__PURE__ */ jsx("button", { onClick: () => copyToClipboard(viewUrl, setCopied), style: {
                background: copied ? "rgba(201,168,76,0.15)" : "transparent",
                border: "none",
                borderLeft: "1px solid var(--border)",
                padding: "0.65rem 1rem",
                cursor: "pointer",
                color: copied ? "var(--gold)" : "var(--text-muted)",
                fontSize: "0.7rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontWeight: 500,
                transition: "all 0.2s ease",
                whiteSpace: "nowrap"
              }, children: copied ? "✓ Copied" : "Copy" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: {
            marginBottom: "1.5rem"
          }, children: [
            /* @__PURE__ */ jsx("label", { style: {
              display: "block",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "0.5rem"
            }, children: "Direct Image URL" }),
            /* @__PURE__ */ jsxs("div", { style: {
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              overflow: "hidden"
            }, children: [
              /* @__PURE__ */ jsx("input", { readOnly: true, value: typeof window !== "undefined" ? `${window.location.origin}${imageUrl}` : imageUrl, style: {
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                padding: "0.65rem 0.75rem",
                color: "var(--text-muted)",
                fontSize: "0.8rem",
                fontFamily: "Menlo, Monaco, monospace",
                cursor: "text",
                minWidth: 0
              }, onClick: (e) => e.target.select() }),
              /* @__PURE__ */ jsx("button", { onClick: () => copyToClipboard(typeof window !== "undefined" ? `${window.location.origin}${imageUrl}` : imageUrl, setCopiedDirect), style: {
                background: copiedDirect ? "rgba(201,168,76,0.15)" : "transparent",
                border: "none",
                borderLeft: "1px solid var(--border)",
                padding: "0.65rem 1rem",
                cursor: "pointer",
                color: copiedDirect ? "var(--gold)" : "var(--text-muted)",
                fontSize: "0.7rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontWeight: 500,
                transition: "all 0.2s ease",
                whiteSpace: "nowrap"
              }, children: copiedDirect ? "✓ Copied" : "Copy" })
            ] })
          ] }),
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
              "Upload Another"
            ] }) }),
            /* @__PURE__ */ jsx("a", { href: imageUrl, download: true, style: {
              flex: 1,
              textDecoration: "none"
            }, children: /* @__PURE__ */ jsxs("button", { className: "btn-gold", style: {
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }, children: [
              /* @__PURE__ */ jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", children: [
                /* @__PURE__ */ jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                /* @__PURE__ */ jsx("polyline", { points: "7 10 12 15 17 10" }),
                /* @__PURE__ */ jsx("line", { x1: "12", y1: "15", x2: "12", y2: "3" })
              ] }),
              "Download"
            ] }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { style: {
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "0.68rem",
        letterSpacing: "0.08em",
        marginTop: "2rem"
      }, children: "IMGUL · IMAGE HOSTING" })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      ` })
  ] });
}
export {
  ViewPage as component
};
