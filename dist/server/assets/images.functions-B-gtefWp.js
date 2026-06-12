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
  const id = crypto.randomUUID();
  const store = getStore("images");
  await store.set(id, buffer, {
    metadata: {
      filename: file.name,
      mimeType,
      size: buffer.byteLength,
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  });
  return {
    id,
    filename: file.name,
    mimeType,
    size: buffer.byteLength
  };
});
export {
  uploadImage_createServerFn_handler
};
