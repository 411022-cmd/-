# 背單字卡（純前端）

簡單的單字卡 web app（純 HTML/CSS/JS，不使用框架），功能：

- 中央卡片點擊翻頁（正面為英文，背面顯示翻譯、詞性、字根/字源）。
- 管理頁可新增/編輯單字，並有「自動填入」按鈕會呼叫線上 API 取得翻譯/詞性/來源
- 單字會儲存在 `localStorage`，重新整理仍保留。

如何使用

1. 在本地開啟 `index.html`（或啟動簡易靜態 server）：

```bash
# 使用 python 內建 server
python3 -m http.server 8000
# 然後瀏覽 http://localhost:8000
```

2. 點擊右上角 `管理單字`，輸入英文後可按 `自動填入`（會呼叫 dictionaryapi.dev 與 libretranslate.de）。
3. 按 `儲存` 可將單字加入清單，之後在卡片區可翻閱與切換單字。

注意事項

- 自動填入依賴公開 API，可能有 CORS 或流量限制；若失敗可以手動填寫。
- 若需更穩定的翻譯服務，建議替換為付費或自架的翻譯 API。

檔案

- `index.html`：主頁
- `style.css`：樣式
- `app.js`：行為與儲存邏輯
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 智聯翻卡背單字</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- 頂部導覽列：用來切換功能頁 -->
    <nav class="navbar">
        <button id="nav-study" class="nav-btn active">開始背單字</button>
        <button id="nav-admin" class="nav-btn">單字庫管理</button>
    </nav>

    <main class="container">
        <!-- ================= 頁面一：字卡學習區 ================= -->
        <section id="page-study" class="page active">
            <div class="progress" id="progress-text">0 / 0</div>

            <div class="card-container">
                <div class="card" id="flashcard">
                    <!-- 卡片正面 -->
                    <div class="card-face card-front">
                        <div class="word-display" id="card-en">輸入單字以開始</div>
                        <div class="hint">點擊卡片翻面</div>
                    </div>
                    <!-- 卡片背面 -->
                    <div class="card-face card-back">
                        <div class="meta-row">
                            <span class="badge" id="card-pos">詞性</span>
                        </div>
                        <div class="translation-display" id="card-zh">翻譯載入中</div>
                        <div class="etymology-box">
                            <strong>字根/字源/結構分析：</strong>
                            <p id="card-root">暫無分析資料</p>
                        </div>
                        <div class="hint">點擊卡片翻回正面</div>
                    </div>
                </div>
            </div>

            <div class="control-section">
                <button id="prev-btn" class="btn">上一張</button>
                <button id="next-btn" class="btn action-btn">下一張</button>
            </div>
        </section>

        <!-- ================= 頁面二：後台管理區 ================= -->
        <section id="page-admin" class="page">
            <div class="admin-wrapper">
                <h2>新增單字 (支援網路自動智慧填入)</h2>
                <div class="form-container">
                    <div class="input-group">
                        <label for="input-en">英文單字 *</label>
                        <div class="search-box">
                            <input type="text" id="input-en" placeholder="例如: inspect">
                            <button type="button" id="auto-fill-btn" class="btn secondary-btn">🤖 自動填入</button>
                        </div>
                    </div>
                    
                    <div class="input-group">
                        <label for="input-pos">詞性 (Part of Speech)</label>
                        <input type="text" id="input-pos" placeholder="例如: v. / n. / adj.">
                    </div>

                    <div class="input-group">
                        <label for="input-zh">中文翻譯</label>
                        <input type="text" id="input-zh" placeholder="例如: 檢查、審查">
                    </div>

                    <div class="input-group">
                        <label for="input-root">字根字首 / 結構拆解分析</label>
                        <textarea id="input-root" rows="3" placeholder="例如: in- (進入) + spect (看) = 看進去裡面 -> 檢查"></textarea>
                    </div>

                    <button id="save-btn" class="btn action-btn full-width">儲存至字卡庫</button>
                </div>

                <div class="list-section">
                    <h3>目前單字庫清單 (<span id="total-count">0</span>)</h3>
                    <ul class="word-list" id="admin-word-list">
                        <!-- 由 JS 動態生成 -->
                    </ul>
                </div>
            </div>
        </section>
    </main>

    <script src="app.js"></script>
</body>
</html>
