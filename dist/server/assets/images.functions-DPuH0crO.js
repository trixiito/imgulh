import { T as TSS_SERVER_FUNCTION, c as createServerFn } from "../server.js";
import { getStore } from "@netlify/blobs";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const MAX_SIZE = 20 * 1024 * 1024;
const ID_LENGTH = 7;
const ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const MIME_TO_EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/svg+xml": ".svg"
};
const EXPIRY_DURATIONS = {
  "1h": 60 * 60 * 1e3,
  "24h": 24 * 60 * 60 * 1e3,
  "7d": 7 * 24 * 60 * 60 * 1e3,
  "30d": 30 * 24 * 60 * 60 * 1e3
};
function generateShortId() {
  const bytes = new Uint8Array(ID_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ID_CHARS[b % ID_CHARS.length]).join("");
}
const uploadImage_createServerFn_handler = createServerRpc({
  id: "5635624367d233733180912069d9ac2b3bed471b154b0d0d8f4275bbdb0c2cae",
  name: "uploadImage",
  filename: "src/server/images.functions.ts"
}, (opts) => uploadImage.__executeServer(opts));
const uploadImage = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(uploadImage_createServerFn_handler, async ({
  data: formData
}) => {
  const file = formData.get("file");
  if (!file) throw new Error("No file provided");
  const mimeType = file.type;
  if (!mimeType.startsWith("image/")) throw new Error("Only image files are accepted");
  const buffer = await file.arrayBuffer();
  if (buffer.byteLength > MAX_SIZE) throw new Error("File exceeds 20 MB limit");
  const expiry = formData.get("expiry") || "never";
  const expiresAt = expiry !== "never" && EXPIRY_DURATIONS[expiry] ? new Date(Date.now() + EXPIRY_DURATIONS[expiry]).toISOString() : null;
  const ext = MIME_TO_EXT[mimeType] ?? "";
  const id = generateShortId() + ext;
  const store = getStore("images");
  await store.set(id, buffer, {
    metadata: {
      filename: file.name,
      mimeType,
      size: buffer.byteLength,
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
      expiresAt: expiresAt ?? ""
    }
  });
  return {
    id,
    filename: file.name,
    mimeType,
    size: buffer.byteLength,
    expiresAt
  };
});
const createGallery_createServerFn_handler = createServerRpc({
  id: "2df198793dac2ddcab530d47722cbafad47b07a1d186ba90555e4588d96a8970",
  name: "createGallery",
  filename: "src/server/images.functions.ts"
}, (opts) => createGallery.__executeServer(opts));
const createGallery = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createGallery_createServerFn_handler, async ({
  data: formData
}) => {
  const imageIdsRaw = formData.get("imageIds");
  if (!imageIdsRaw) throw new Error("No image IDs provided");
  const imageIds = JSON.parse(imageIdsRaw);
  if (!Array.isArray(imageIds) || imageIds.length < 2) {
    throw new Error("A gallery requires at least 2 images");
  }
  const expiresAt = formData.get("expiresAt") || "";
  const id = generateShortId();
  const store = getStore("galleries");
  await store.set(id, JSON.stringify({
    imageIds,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt: expiresAt || null
  }));
  return {
    id,
    imageIds
  };
});
export {
  createGallery_createServerFn_handler,
  uploadImage_createServerFn_handler
};
