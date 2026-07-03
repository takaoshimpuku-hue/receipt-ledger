# 支出伝票整理

レシート確認、月別集計、ニュースクール売上・原価率、Excel出力、共有URL保存に対応した小さなWebアプリです。

## ローカル起動

```sh
npm start
```

開くURL:

```text
http://127.0.0.1:4174/
```

## クラウド公開

RenderなどのNode.js Webサービスに公開できます。

起動コマンド:

```sh
npm start
```

永続保存用の環境変数:

```text
DATA_DIR=/var/data
```

共有URLは `?share=...` を含むURLです。このURLを知っている人は同じデータを開けます。
