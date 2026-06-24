import { defineConfig, Plugin } from "vite";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as sass from "sass";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const divisionsSource = path.resolve(__dirname, "../../../Divisions/source");
const demoRoot = __dirname;
const LIT_SCSS_PREFIX = "\0lit-scss:";
const SVG_PREFIX = "\0lit-svg:";

function divisionsTsPlugin(): Plugin {
  return {
    name: "divisions-ts-transpile",
    enforce: "pre",
    transform(code, id) {
      if (!id.includes("/Divisions/source/") || !id.endsWith(".ts")) return null;
      const result = ts.transpileModule(code, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2020,
          experimentalDecorators: true,
          useDefineForClassFields: false,
          importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
        },
        fileName: id,
      });
      return { code: result.outputText, map: result.sourceMapText ?? undefined };
    },
  };
}

function litScssPlugin(): Plugin {
  return {
    name: "lit-scss",
    enforce: "pre",
    resolveId(source, importer) {
      if (!source.endsWith(".lit.scss")) return null;
      if (!importer) return null;
      const resolved = path.normalize(path.join(path.dirname(importer), source));
      return `${LIT_SCSS_PREFIX}${resolved}.js`;
    },
    load(id) {
      if (!id.startsWith(LIT_SCSS_PREFIX) || !id.endsWith(".js")) return null;
      const scssPath = id.slice(LIT_SCSS_PREFIX.length, -".js".length);
      const result = sass.compile(scssPath, {
        loadPaths: [divisionsSource],
        style: "expanded",
      });
      const css = result.css.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
      return `import { css } from "lit"; export default css\`${css}\`;`;
    },
  };
}

function litSvgPlugin(): Plugin {
  return {
    name: "lit-svg",
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (!source.endsWith(".svg")) return null;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (!resolved || !resolved.id.endsWith(".svg")) return null;
      return `${SVG_PREFIX}${resolved.id}.js`;
    },
    load(id) {
      if (!id.startsWith(SVG_PREFIX) || !id.endsWith(".js")) return null;
      const svgPath = id.slice(SVG_PREFIX.length, -".js".length);
      const svg = readFileSync(svgPath, "utf-8").trim().replace(/`/g, "\\`");
      return `import { html } from "lit"; export default html\`${svg}\`;`;
    },
  };
}

function defineCoreHostPlugin(): Plugin {
  const shim = path.resolve(demoRoot, "src/shims/defineCoreHost.ts");
  return {
    name: "define-core-host-shim",
    resolveId(source, importer) {
      if (source.endsWith("defineCoreHost") || source.endsWith("defineCoreHost.ts")) {
        if (importer?.includes("serverRequests")) {
          return shim;
        }
      }
      return null;
    },
  };
}

export default defineConfig({
  base: "/divisions/",
  plugins: [divisionsTsPlugin(), defineCoreHostPlugin(), litScssPlugin(), litSvgPlugin()],
  resolve: {
    dedupe: ["lit", "lit-html", "@lit/reactive-element", "axios"],
    alias: [
      { find: "lit", replacement: path.join(demoRoot, "node_modules/lit") },
      { find: "lit-html", replacement: path.join(demoRoot, "node_modules/lit-html") },
      { find: "@lit/reactive-element", replacement: path.join(demoRoot, "node_modules/@lit/reactive-element") },
      { find: "axios", replacement: path.join(demoRoot, "node_modules/axios") },
      { find: "xlsx-js-style", replacement: path.resolve(demoRoot, "src/shims/xlsx-js-style.ts") },
      { find: "entities", replacement: path.join(divisionsSource, "entities") },
      { find: "shared", replacement: path.join(divisionsSource, "shared") },
      { find: "pages", replacement: path.join(divisionsSource, "pages") },
      { find: "widgets", replacement: path.join(divisionsSource, "widgets") },
      { find: "app", replacement: path.join(divisionsSource, "app") },
    ],
  },
  build: {
    chunkSizeWarningLimit: 2000,
  },
});
