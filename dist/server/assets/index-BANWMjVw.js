import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useRouter } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "../server.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const uploadImage = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("5635624367d233733180912069d9ac2b3bed471b154b0d0d8f4275bbdb0c2cae"));
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif", "image/svg+xml"];
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function UploadPage() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const handleFile = useCallback((f) => {
    setError(null);
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError("Unsupported format. Please upload a JPEG, PNG, GIF, WebP, AVIF, or SVG.");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError("File exceeds the 20 MB limit.");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result);
    reader.readAsDataURL(f);
  }, []);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, [handleFile]);
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImage({
        data: formData
      });
      router.navigate({
        to: "/view/$imageId",
        params: {
          imageId: result.id
        }
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
      setUploading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative min-h-screen flex flex-col items-center justify-center px-4 py-16", children: [
    /* @__PURE__ */ jsx("div", { style: {
      position: "fixed",
      top: "30%",
      left: "50%",
      transform: "translateX(-50%)",
      width: "600px",
      height: "400px",
      borderRadius: "50%",
      background: "radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)",
      pointerEvents: "none",
      zIndex: 0
    } }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 w-full max-w-lg fade-up", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsx("div", { className: "ornament mb-6", children: /* @__PURE__ */ jsx("span", { style: {
          color: "var(--gold)",
          fontSize: "0.65rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase"
        }, children: "✦" }) }),
        /* @__PURE__ */ jsx("h1", { className: "gold-gradient", style: {
          fontSize: "3rem",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          margin: 0,
          lineHeight: 1.1
        }, children: "ImgUl" }),
        /* @__PURE__ */ jsx("p", { style: {
          color: "var(--text-muted)",
          fontSize: "0.8rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginTop: "0.6rem"
        }, children: "Image Hosting" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass-card", style: {
        borderRadius: "16px",
        padding: "2rem",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)"
      }, children: [
        !file ? /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: `upload-zone ${dragging ? "dragging" : ""}`, style: {
          borderRadius: "12px",
          padding: "3rem 2rem",
          textAlign: "center",
          cursor: "pointer"
        }, onClick: () => inputRef.current?.click(), onDragOver: (e) => {
          e.preventDefault();
          setDragging(true);
        }, onDragLeave: () => setDragging(false), onDrop, children: [
          /* @__PURE__ */ jsx("input", { ref: inputRef, type: "file", accept: ACCEPTED_TYPES.join(","), style: {
            display: "none"
          }, onChange: (e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          } }),
          /* @__PURE__ */ jsxs("div", { style: {
            position: "relative",
            zIndex: 1
          }, children: [
            /* @__PURE__ */ jsx("div", { style: {
              marginBottom: "1rem"
            }, children: /* @__PURE__ */ jsxs("svg", { width: "40", height: "40", viewBox: "0 0 24 24", fill: "none", stroke: "var(--gold)", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", style: {
              margin: "0 auto",
              opacity: 0.8
            }, children: [
              /* @__PURE__ */ jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
              /* @__PURE__ */ jsx("polyline", { points: "17 8 12 3 7 8" }),
              /* @__PURE__ */ jsx("line", { x1: "12", y1: "3", x2: "12", y2: "15" })
            ] }) }),
            /* @__PURE__ */ jsx("p", { style: {
              color: "var(--text)",
              fontSize: "0.95rem",
              margin: "0 0 0.4rem",
              fontWeight: 400
            }, children: "Drop your image here" }),
            /* @__PURE__ */ jsx("p", { style: {
              color: "var(--text-muted)",
              fontSize: "0.78rem",
              margin: 0
            }, children: "or click to browse — up to 20 MB" }),
            /* @__PURE__ */ jsx("p", { style: {
              color: "var(--text-muted)",
              fontSize: "0.7rem",
              marginTop: "0.8rem",
              letterSpacing: "0.05em"
            }, children: "JPEG · PNG · GIF · WebP · AVIF · SVG" })
          ] })
        ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { style: {
            borderRadius: "10px",
            overflow: "hidden",
            marginBottom: "1.25rem",
            position: "relative"
          }, children: [
            preview && /* @__PURE__ */ jsx("img", { src: preview, alt: "Preview", style: {
              width: "100%",
              maxHeight: "280px",
              objectFit: "contain",
              background: "rgba(0,0,0,0.3)",
              display: "block"
            } }),
            /* @__PURE__ */ jsx("button", { onClick: () => {
              setFile(null);
              setPreview(null);
              setError(null);
            }, style: {
              position: "absolute",
              top: "0.6rem",
              right: "0.6rem",
              background: "rgba(8,8,16,0.85)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: "var(--text-muted)",
              padding: "4px 8px",
              cursor: "pointer",
              fontSize: "0.7rem",
              letterSpacing: "0.05em"
            }, children: "✕ Remove" })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.75rem 1rem",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            marginBottom: "1.25rem"
          }, children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { style: {
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--text)",
                fontWeight: 400,
                maxWidth: "240px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }, children: file.name }),
              /* @__PURE__ */ jsxs("p", { style: {
                margin: "2px 0 0",
                fontSize: "0.72rem",
                color: "var(--text-muted)"
              }, children: [
                formatBytes(file.size),
                " · ",
                file.type.split("/")[1].toUpperCase()
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { style: {
              color: "var(--gold)",
              opacity: 0.8
            }, children: /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", children: [
              /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
              /* @__PURE__ */ jsx("circle", { cx: "8.5", cy: "8.5", r: "1.5" }),
              /* @__PURE__ */ jsx("polyline", { points: "21 15 16 10 5 21" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsx("button", { className: "btn-gold", onClick: handleUpload, disabled: uploading, style: {
            width: "100%",
            padding: "0.85rem",
            borderRadius: "8px",
            border: "none",
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.8 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem"
          }, children: uploading ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { style: {
              display: "inline-block",
              width: "14px",
              height: "14px",
              border: "2px solid rgba(0,0,0,0.3)",
              borderTopColor: "#0a080a",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite"
            } }),
            "Uploading…"
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", children: [
              /* @__PURE__ */ jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
              /* @__PURE__ */ jsx("polyline", { points: "17 8 12 3 7 8" }),
              /* @__PURE__ */ jsx("line", { x1: "12", y1: "3", x2: "12", y2: "15" })
            ] }),
            "Upload Image"
          ] }) }),
          uploading && /* @__PURE__ */ jsx("div", { style: {
            marginTop: "0.75rem",
            height: "2px",
            borderRadius: "1px",
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden"
          }, children: /* @__PURE__ */ jsx("div", { className: "progress-bar", style: {
            height: "100%",
            width: "100%"
          } }) })
        ] }),
        error && /* @__PURE__ */ jsx("p", { style: {
          marginTop: "1rem",
          padding: "0.7rem 1rem",
          background: "rgba(220,80,80,0.1)",
          border: "1px solid rgba(220,80,80,0.3)",
          borderRadius: "8px",
          color: "#f08080",
          fontSize: "0.8rem",
          margin: "1rem 0 0"
        }, children: error })
      ] }),
      /* @__PURE__ */ jsx("p", { style: {
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "0.7rem",
        letterSpacing: "0.08em",
        marginTop: "2rem"
      }, children: "IMAGES ARE STORED SECURELY · IMGUL.COM" })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes spin { to { transform: rotate(360deg); } }
      ` })
  ] });
}
export {
  UploadPage as component
};
