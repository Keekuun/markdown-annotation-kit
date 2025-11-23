import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/styles.css"],
  format: ["esm", "cjs"],
  dts: {
    entry: ["src/index.ts"],
    resolve: true,
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: process.env.NODE_ENV === "production",
  external: ["react", "react-dom", "react-markdown", "remark-gfm", "rehype-raw"],
  outDir: "dist",
  banner: {
    js: '"use client";',
  },
  esbuildOptions(options) {
    options.legalComments = "none";
    options.banner = {
      js: '"use client";',
    };
  },
  onSuccess: "echo 'Build completed successfully!'",
});

