# CSL プレビュー

参考文献リストをカスタム CSL スタイルでプレビューするツールです。Zotero や [CSL Visual Editor](https://editor.citationstyles.org/) と同じ **citeproc-js** を使用します。

## セットアップ

```bash
npm install
```

## 使い方

CSL スタイルファイルは **必須** で `--csl` で指定します。参考文献 JSON は省略時 `references.json` です。

```bash
node csl_render.mjs --csl <style.csl> [--refs references.json]
```

例:

```bash
node csl_render.mjs --csl mizu-kankyo-gakkaishi.csl
node csl_render.mjs --csl nature.csl --refs my-refs.json
```

## 入力形式

参考文献ファイルは CSL JSON 形式（Zotero エクスポートと同形式）です。

```json
[
  {
    "id": "wada2006",
    "type": "article-journal",
    "author": [
      { "family": "和田", "given": "桂子" },
      { "family": "藤井", "given": "滋穂" }
    ],
    "issued": { "date-parts": [[2006]] },
    "title": "論文タイトル",
    "container-title": "水環境学会誌",
    "volume": "29",
    "issue": "11",
    "page": "699-704"
  }
]
```
