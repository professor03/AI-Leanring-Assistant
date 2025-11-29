# 部署指南 🚀

您的應用程式已成功打包！現在您可以透過 **Netlify** 或 **Vercel** 免費將其部署到網路上。

## 選項 1：Netlify Drop (最簡單快速)

1.  開啟 [Netlify Drop](https://app.netlify.com/drop) 網站。
2.  在您的專案目錄中找到 `dist` 資料夾：
    `c:\Users\user\Desktop\aistudent\dist`
3.  將整個 `dist` 資料夾**拖放**到 Netlify 網頁上。
4.  Netlify 會自動部署您的網站，並提供一個可用的網址！

## 選項 2：Vercel (長期維護推薦)

如果您已安裝 Vercel CLI：

1.  在專案資料夾中開啟終端機。
2.  **若出現 Token 錯誤或首次使用，請先登入**：
    ```bash
    npx vercel login
    ```
    (選擇 Continue with GitHub 或 Email 進行驗證)
3.  執行部署指令：
    ```bash
    npx vercel
    ```
4.  依照提示操作（通常一直按 Enter 使用預設值即可）。

## 選項 3：Surge.sh (指令列工具)

1.  在終端機中執行以下指令：
    ```bash
    npx surge ./dist
    ```
2.  依照提示輸入您的 Email 和密碼。
3.  部署完成後，您會獲得一個 `.surge.sh` 的網址。

---

**注意**：由於這是一個單頁應用程式 (SPA)，如果您在 Netlify/Vercel 上重新整理首頁以外的頁面，可能會出現 404 錯誤。要解決這個問題，通常需要設定重寫規則 (Rewrite Rule)，但在測試階段，建議您一律從首頁開始瀏覽。
