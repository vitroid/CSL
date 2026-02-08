# CSL プレビュー

参考文献リストをカスタム CSL スタイルでプレビューするツールです。

## レンダラーの選択

| レンダラー | 精度 | 備考 |
|-----------|------|------|
| **Node.js (citeproc-js)** | ★★★ 高 | Zotero・CSL サイトと同じエンジン。推奨。 |
| Python (citeproc-py) | ★★☆ 中 | テスト通過率〜60%、locale 等の差異あり |

## Node.js 版（推奨）

Zotero や [CSL Visual Editor](https://editor.citationstyles.org/) と同じ **citeproc-js** を使用します。

```bash
cd csl_preview
npm install
node csl_render.mjs
```

### オプション

```bash
# 別の CSL ファイルを指定
node csl_render.mjs --csl ../mizu-kankyo-gakkaishi.csl

# 別の参考文献 JSON を指定
node csl_render.mjs --refs my-references.json
```

### 入力形式

`references.json` は CSL JSON 形式（Zotero エクスポートと同形式）です。

```json
[
  {
    "id": "wada2006",
    "type": "article-journal",
    "author": [
      {"family": "和田", "given": "桂子"},
      {"family": "藤井", "given": "滋穂"}
    ],
    "issued": {"date-parts": [[2006]]},
    "title": "論文タイトル",
    "container-title": "水環境学会誌",
    "volume": "29",
    "issue": "11",
    "page": "699-704"
  }
]
```

## Python 版

```bash
# プロジェクト直下で
poetry run python csl_preview/csl_render.py
```
