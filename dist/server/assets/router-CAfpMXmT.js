import { createRootRoute, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsxs, jsx } from "react/jsx-runtime";
import { getStore } from "@netlify/blobs";
const Route$3 = createRootRoute({
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
const $$splitComponentImporter$1 = () => import("./index-BANWMjVw.js");
const Route$2 = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./view._imageId-DRizWv6K.js");
const Route$1 = createFileRoute("/view/$imageId")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const Route = createFileRoute("/api/image/$imageId")({
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
        const mimeType = metadata.mimeType ?? "image/jpeg";
        return new Response(data, {
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=31536000, immutable"
          }
        });
      }
    }
  }
});
const IndexRoute = Route$2.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$3
});
const ViewImageIdRoute = Route$1.update({
  id: "/view/$imageId",
  path: "/view/$imageId",
  getParentRoute: () => Route$3
});
const ApiImageImageIdRoute = Route.update({
  id: "/api/image/$imageId",
  path: "/api/image/$imageId",
  getParentRoute: () => Route$3
});
const rootRouteChildren = {
  IndexRoute,
  ViewImageIdRoute,
  ApiImageImageIdRoute
};
const routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
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
  Route$1 as R,
  router as r
};
