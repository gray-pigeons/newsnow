import { join } from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import unocss from "unocss/vite"
import unimport from "unimport/unplugin"
import dotenv from "dotenv"
import nitro from "./nitro.config"
import { projectDir } from "./shared/dir"
import pwa from "./pwa.config"

dotenv.config({
  path: join(projectDir, ".env.server"),
})

export default defineConfig({
  resolve: {
    alias: {
      "~": join(projectDir, "src"),
      "@shared": join(projectDir, "shared"),
    },
  },
  plugins: [
    TanStackRouterVite({
      // error with auto import and vite-plugin-pwa
      // autoCodeSplitting: true,
    }),
    unimport.vite({
      dirs: ["src/hooks", "src/utils", "src/atoms", "shared/{consts,metadata,sources,type.util,utils,verify}.ts"],
      presets: ["react", {
        from: "jotai",
        imports: ["atom", "useAtom", "useAtomValue", "useSetAtom"],
      }],
      imports: [
        { from: "clsx", name: "clsx", as: "$" },
        { from: "jotai/utils", name: "atomWithStorage" },
      ],
      dts: "imports.app.d.ts",
    }),
    unocss(),
    react(),
    pwa(),
    nitro(),
  ],
   // ✅ 添加以下 build 配置
 build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 只对 node_modules 中的依赖进行拆分
          if (id.includes('node_modules')) {
            // 提取包名（支持 scoped 包）
            const match = id.match(/node_modules\/(?:@[^/]+\/)?([^/]+)/);
            if (match) {
              const pkgName = match[1];
              // 你可以为某些大库指定单独分组，或者统一放在 vendor 中
              return `vendor-${pkgName}`;
            }
          }
        },
      },
    },
  },
})
