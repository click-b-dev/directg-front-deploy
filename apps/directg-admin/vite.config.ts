import { defineConfig, type AliasOptions } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { fileURLToPath, URL } from "node:url";
import path from "node:path";

const adminSrc = fileURLToPath(new URL("./src", import.meta.url));
// @click-b/ui 소스는 내부에서 `@/machines/...`처럼 자기 패키지 src를 가리키는 `@` 별칭을 쓴다.
const uiSrc = fileURLToPath(new URL("../../packages/ui/src", import.meta.url));

const aliasRoot: AliasOptions = [
  {
    // `@/*`는 importer가 packages/ui 안이면 ui의 src로, 그 외에는 admin의 src로 해석한다.
    find: /^@\/(.*)$/,
    replacement: "$1",
    customResolver(this, updatedId, importer, options) {
      const base = importer?.startsWith(uiSrc) ? uiSrc : adminSrc;
      return this.resolve(path.join(base, updatedId), importer, { ...options, skipSelf: true });
    },
  },
  { find: "@app", replacement: path.join(adminSrc, "app") },
  { find: "@screens", replacement: path.join(adminSrc, "screens") },
  { find: "@widgets", replacement: path.join(adminSrc, "widgets") },
  { find: "@features", replacement: path.join(adminSrc, "features") },
  { find: "@entities", replacement: path.join(adminSrc, "entities") },
  { find: "@shared", replacement: path.join(adminSrc, "shared") },
];

export default defineConfig({
  plugins: [TanStackRouterVite({}), react(), tailwindcss()],
  resolve: { alias: aliasRoot },
});
