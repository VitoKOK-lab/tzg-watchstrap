# 泰熙爾札娜｜珠寶錶帶諮詢網站

以 Apple Watch 產品頁風格與品牌 CIS 製作的響應式一頁網站。

## 功能

- 五款錶帶，白K／黃K／玫瑰金／黑金四色。
- LINE 截圖的逐款、材質與鑲嵌確定定價；伺服器保存所選價格快照。
- 三類諮詢、必填預算與聯絡方式，成功儲存後產生諮詢編號及官方 LINE 入口。
- D1 保存諮詢；重試使用同一 request ID，避免重複送單。
- `/admin` 與管理 API 皆驗證 ChatGPT 身分及伺服器 ADMIN_EMAILS 白名單。
- 桌面並排展示，手機滑動選款、單欄表單、底部諮詢入口。

## 設定與維護

- `lib/catalog.ts`：五款定價、四色、預算、官方 LINE。
- `components/atelier.tsx`：前台與對外聯絡資料。
- `app/globals.css`：CIS 色彩、字型與響應式排版。
- `db/schema.ts` / `drizzle/`：資料表與由 Drizzle 產生的遷移。
- `ADMIN_EMAILS`：逗號分隔的管理者 Email，存於 Sites runtime secret。缺少設定即拒絕管理存取。
- `docs/後台登入與上線.md`：管理者登入、GitHub 與正式環境的操作說明。

請依 Sites 技能執行建置與發布。新版本應沿用 `.openai/hosting.json` 中的 project_id，不重新建立 Site。

本機：`npm run dev`。首次建立本機資料库前先依 Sites 建置流程產生 `dist/server/wrangler.json`，然後以 Wrangler 將 `drizzle/` 的待執行遷移套用至 `.wrangler/state`。正式發布由 Sites 套用遷移。

本機預覽的登入模拟帳號為 `seedy@sites.test`，未列在正式管理者白名單中，因此預期會顯示無權限。正式網站使用平台 ChatGPT 登入，不依賴此測試身分。

## 驗證

- TypeScript 檢查、正式 Worker 建置。
- 本機資料庫送出、重試去重、錯誤資料、跨來源拒絕。
- 匿名 401、未授權帳號 403、授權管理者讀取與狀態更新。
- 手機及桌面版型、選款帶入、成功頁與 LINE 編號。
- 測試資料只寫入本機，不寫入正式客戶名單。
