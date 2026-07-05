#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { renderToStaticMarkup } from "react-dom/server";

// components/discord-cta.tsx is a plain .tsx file with no test runner in this
// repo to render it, so we transpile it in-process (via the `typescript`
// devDependency already installed) and render the real component output with
// react-dom/server — no new test framework required.
const repoRoot = path.resolve(import.meta.dirname, "..");
const componentPath = path.join(repoRoot, "components", "discord-cta.tsx");
// Stub the icon import: node can't load sibling .tsx files, and the icon's
// markup is irrelevant to what this test asserts (CTA text/link presence).
const source = fs
  .readFileSync(componentPath, "utf8")
  .replace(/import\s*\{\s*ChatIcon\s*\}\s*from\s*"@\/components\/icons";/, 'const ChatIcon = () => null;');

const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
});

const tmpPath = path.join(repoRoot, "scripts", `.discord-cta-render.${process.pid}.mjs`);
fs.writeFileSync(tmpPath, outputText);
let DiscordCta;
try {
  ({ default: DiscordCta } = await import(`file://${tmpPath}`));
} finally {
  fs.rmSync(tmpPath, { force: true });
}

const withUrl = renderToStaticMarkup(
  DiscordCta({ url: "https://discord.gg/exampleclub" })
);
assert.match(withUrl, /Join Discord/);
assert.match(withUrl, /href="https:\/\/discord\.gg\/exampleclub"/);
assert.match(withUrl, /target="_blank"/);

for (const blank of [null, undefined, "", "   "]) {
  assert.equal(renderToStaticMarkup(DiscordCta({ url: blank })), "", `expected no CTA for ${JSON.stringify(blank)}`);
}

console.log("discord CTA render validation passed");
