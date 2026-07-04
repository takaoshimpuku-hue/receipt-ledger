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

## 無料のクラウド公開

Render FreeなどのNode.js Webサービスに公開できます。

起動コマンド:

```sh
npm start
```

無料でデータを残す場合は、Supabase Freeのデータベースを保存先にします。

SupabaseのSQL Editorで最初に1回だけ実行:

```sql
create table if not exists public.receipt_shares (
  token text primary key,
  payload jsonb,
  updated_at timestamptz not null default now()
);
```

RenderのEnvironment Variablesに入れる値:

```text
SUPABASE_URL=SupabaseのProject URL
SUPABASE_SERVICE_ROLE_KEY=Supabaseのservice_role secret key
```

共有URLは `?share=...` を含むURLです。このURLを知っている人は同じデータを開けます。

## 有料Diskを使う場合

Renderの有料プランでPersistent Diskを使う場合は、Environment Variablesに以下を入れます。

```text
DATA_DIR=/var/data
```

DiskのMount Pathも `/var/data` にします。
