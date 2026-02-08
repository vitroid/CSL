#!/usr/bin/env node
/**
 * CSL レンダラー（citeproc-js 使用）
 *
 * Zotero・CSL サイトと同じ citeproc-js エンジンを使用。
 * 日本語文献など、高精度な出力が得られます。
 *
 * 使い方:
 *   node csl_render.mjs --csl <style.csl> [--refs references.json]
 */

import { readFileSync } from "fs";
import { createRequire } from "module";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// citeproc-js (Zotero/CSL サイトと同じエンジン)
const CSL = require("citeproc");

const DEFAULT_LOCALE = "en-US";
const LOCALE_URL =
  "https://raw.githubusercontent.com/citation-style-language/locales/master/locales-";

const USAGE =
  "Usage: node csl_render.mjs --csl <style.csl> [--refs references.json]";

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { csl: null, refs: "references.json" };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--csl" && args[i + 1]) {
      result.csl = args[++i];
    } else if (args[i] === "--refs" && args[i + 1]) {
      result.refs = args[++i];
    }
  }
  return result;
}

function findFile(name, bases) {
  for (const base of bases) {
    const p = resolve(base, name);
    try {
      readFileSync(p);
      return p;
    } catch {
      continue;
    }
  }
  return null;
}

function loadLocale(lang, baseDir) {
  const localPath = join(baseDir, `locales-${lang}.xml`);
  try {
    return readFileSync(localPath, "utf-8");
  } catch {
    return null;
  }
}

async function fetchLocale(lang) {
  try {
    const res = await fetch(`${LOCALE_URL}${lang}.xml`);
    if (res.ok) return await res.text();
  } catch {
    return null;
  }
  return null;
}

async function main() {
  const { csl, refs } = parseArgs();
  if (!csl) {
    console.error(USAGE);
    console.error("Error: --csl <style.csl> is required.");
    process.exit(1);
  }

  const scriptDir = __dirname;
  const projectRoot = resolve(scriptDir, "..");

  const cslPath =
    findFile(csl, [scriptDir, projectRoot]) || findFile(csl, [process.cwd()]);
  if (!cslPath) {
    console.error(`CSL file not found: ${csl}`);
    process.exit(1);
  }

  const refsPath =
    findFile(refs, [scriptDir, projectRoot]) || findFile(refs, [process.cwd()]);
  if (!refsPath) {
    console.error(`References file not found: ${refs}`);
    process.exit(1);
  }

  const styleXml = readFileSync(cslPath, "utf-8");
  const refsData = JSON.parse(readFileSync(refsPath, "utf-8"));

  // CSL JSON を keyed 形式に変換
  const citations = {};
  const itemIDs = [];
  for (const item of refsData) {
    const id = item.id || item.ID;
    if (!id) continue;
    citations[id] = item;
    itemIDs.push(id);
  }

  // ローカル locale を優先、なければ fetch
  let localeXml =
    loadLocale(DEFAULT_LOCALE, scriptDir) ||
    loadLocale(DEFAULT_LOCALE, projectRoot);
  if (!localeXml) {
    localeXml = await fetchLocale(DEFAULT_LOCALE);
  }
  if (!localeXml) {
    console.error(
      "Locale en-US not found. Place locales-en-US.xml in the project directory."
    );
    process.exit(1);
  }

  const citeprocSys = {
    retrieveLocale: (lang) => {
      if (lang === DEFAULT_LOCALE) return localeXml;
      return (
        loadLocale(lang, scriptDir) || loadLocale(lang, projectRoot) || null
      );
    },
    retrieveItem: (id) => citations[id],
  };

  const engine = new CSL.Engine(citeprocSys, styleXml);
  engine.updateItems(itemIDs);

  const [info, bibStrings] = engine.makeBibliography();
  if (!bibStrings || bibStrings.length === 0) {
    console.log("(No bibliography items)");
    return;
  }

  // HTML をプレーンテキストに変換（タグ除去、&nbsp;→スペース、&#38;→&）
  const toPlainText = (html) =>
    html
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&#38;/g, "&")
      .replace(/\s+/g, " ")
      .trim();

  console.log("Bibliography");
  console.log("-----------");
  for (const s of bibStrings) {
    console.log(toPlainText(s));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
