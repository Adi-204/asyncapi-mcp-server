import { build } from "esbuild";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: "dist/index.js",
  banner: {
    js: "",
  },
  define: {
    __PKG_NAME__: JSON.stringify(pkg.name),
    __PKG_VERSION__: JSON.stringify(pkg.version),
  },
  external: [
    "fsevents",
    "ajv/lib/refs/json-schema-draft-04.json",
  ],
  sourcemap: false,
  minify: true,
  keepNames: true,
  metafile: true,
  loader: {
    ".json": "json",
  },
}).then((result) => {
  const output = Object.values(result.metafile.outputs).find((o) =>
    o.entryPoint
  );
  if (output) {
    const sizeKB = (output.bytes / 1024).toFixed(1);
    console.log(`Bundle: dist/index.js (${sizeKB} KB)`);
  }
});
