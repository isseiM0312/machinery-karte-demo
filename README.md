# 商用機械デジタルカルテ — 提案デモ

H-Navi 17264（No.202606220022）向けの簡易デモ画面。  
トラックバンク型の「1台詳細カルテ」UIを、社内管理向け商用機械に置き換えたイメージ。

## 画面構成

1. **一覧（検索）** — トラックバンク型の絞り込み + リスト
2. **詳細カルテ** — 1台ごとの写真・仕様・履歴・添付

URL: `#list` / `#detail/MK-2024-0187`

```bash
cd demo/machinery-karte
python3 -m http.server 8765
# http://localhost:8765
```

## パスワード（提案先共有用）

- **Password:** `wl-karte-2026`

> GitHub Pages 単体ではサーバー側 Basic 認証不可。  
> デモ用途の簡易ゲート（sessionStorage）です。本番は VPN / SSO / Cloudflare Access 等を推奨。

## GitHub Pages 公開

```bash
# 例: wander-lust/machinery-karte-demo リポジトリ root に本ディレクトリ内容を push
# Settings → Pages → Deploy from branch → main / root
```

公開URL例: `https://wander-lust.github.io/machinery-karte-demo/`
