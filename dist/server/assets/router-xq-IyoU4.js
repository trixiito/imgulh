import { createRootRoute, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsxs, jsx } from "react/jsx-runtime";
import { z } from "zod";
import { getStore } from "@netlify/blobs";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "../server.js";
const Route$5 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ImgUl — Image Hosting" },
      { name: "description", content: "Fast image hosting with instant shareable links." }
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com"
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500&display=swap"
      }
    ]
  }),
  shellComponent: RootDocument
});
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$2 = () => import("./index-Cdk3hGMM.js");
const Route$4 = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./view._imageId-DJA-hzj8.js");
const Route$3 = createFileRoute("/view/$imageId")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component"),
  validateSearch: z.object({
    expiresAt: z.string().optional()
  })
});
const $$splitComponentImporter = () => import("./gallery._galleryId-DpddYMy0.js");
const Route$2 = createFileRoute("/gallery/$galleryId")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
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
createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(createSsrRpc("b5c2994279aaf6c925d686e809e9f3893bbba4a55b0dfa5e7fe7e981818eff7a"));
async function incrementViews(imageId) {
  const store = getStore("stats");
  const raw = await store.get(imageId);
  let views = 0;
  if (raw) {
    try {
      const stats = JSON.parse(raw);
      if (typeof stats.views === "number") {
        views = stats.views;
      }
    } catch {
    }
  }
  views += 1;
  await store.set(imageId, JSON.stringify({
    views
  }));
}
const Route$1 = createFileRoute("/api/image/$imageId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { imageId } = params;
        const store = getStore("images");
        const result = await store.getWithMetadata(imageId, { type: "arrayBuffer" });
        if (!result) {
          return new Response("Image not found", { status: 404 });
        }
        const { data, metadata } = result;
        const meta = metadata;
        if (meta.expiresAt && new Date(meta.expiresAt) < /* @__PURE__ */ new Date()) {
          await store.delete(imageId);
          return new Response("Image has expired", { status: 410 });
        }
        const mimeType = meta.mimeType ?? "image/jpeg";
        incrementViews(imageId).catch(console.error);
        return new Response(data, {
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": meta.expiresAt ? "public, max-age=3600" : "public, max-age=31536000, immutable"
          }
        });
      }
    }
  }
});
const Route = createFileRoute("/api/gallery/$galleryId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { galleryId } = params;
        const store = getStore("galleries");
        const data = await store.get(galleryId, { type: "text" });
        if (!data) return new Response("Gallery not found", { status: 404 });
        const gallery = JSON.parse(data);
        if (gallery.expiresAt && new Date(gallery.expiresAt) < /* @__PURE__ */ new Date()) {
          await store.delete(galleryId);
          return new Response("Gallery has expired", { status: 410 });
        }
        return new Response(JSON.stringify(gallery), {
          headers: { "Content-Type": "application/json" }
        });
      }
    }
  }
});
const IndexRoute = Route$4.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$5
});
const ViewImageIdRoute = Route$3.update({
  id: "/view/$imageId",
  path: "/view/$imageId",
  getParentRoute: () => Route$5
});
const GalleryGalleryIdRoute = Route$2.update({
  id: "/gallery/$galleryId",
  path: "/gallery/$galleryId",
  getParentRoute: () => Route$5
});
const ApiImageImageIdRoute = Route$1.update({
  id: "/api/image/$imageId",
  path: "/api/image/$imageId",
  getParentRoute: () => Route$5
});
const ApiGalleryGalleryIdRoute = Route.update({
  id: "/api/gallery/$galleryId",
  path: "/api/gallery/$galleryId",
  getParentRoute: () => Route$5
});
const rootRouteChildren = {
  IndexRoute,
  GalleryGalleryIdRoute,
  ViewImageIdRoute,
  ApiGalleryGalleryIdRoute,
  ApiImageImageIdRoute
};
const routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$3 as R,
  Route$2 as a,
  createSsrRpc as c,
  router as r
};
