# DAWN HR - 人事管理

DAWN SERIES の人事管理 (HR) アプリケーションです。

## 機能

- 従業員管理（CRUD）
- 勤怠管理（出勤・退勤打刻）
- 休暇申請・承認

## 技術スタック

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase (Auth + Database)
- Playwright (E2E テスト)

## セットアップ

```bash
npm install
cp .env.local.example .env.local  # 環境変数を設定
npm run dev
```

## 開発

```bash
npm run dev      # 開発サーバー (port 3006)
npm run build    # ビルド
npm run lint     # ESLint
npx playwright test  # E2Eテスト
```

## データベース

`supabase/schema.sql` を Supabase の SQL エディタで実行してください。
