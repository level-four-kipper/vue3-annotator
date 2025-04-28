import { defineConfig, loadEnv, ConfigEnv, UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import { resolve } from "path";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  return {
    base: "./",
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
    },

    plugins: [
      vue(),
      AutoImport({
        imports: ["vue", "vue-router", "pinia"],
        dts: "auto-imports.d.ts",
        resolvers: [ElementPlusResolver()],
        eslintrc: {
          enabled: true, // <-- this
        },
      }),
    ],

    build: {
      lib: {
        entry: "./src/index.ts",
        name: "VAnnotator",
        fileName: (format) => `vue3-annotator.${format}.js`,
        formats: ["es", "cjs"], // 输出 ESM 和 CommonJS 格式
      },
      rollupOptions: {
        // 确保外部化处理那些你不想打包进库的依赖
        external: ["vue"],
        output: {
          globals: {
            vue: "Vue",
          },
        },
      },
    },
  };
});
