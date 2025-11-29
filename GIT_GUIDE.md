# Git 快速參考指南

## 日常操作

### 提交更改
\`\`\`bash
git add .
git commit -m "簡短描述你的更改"
\`\`\`

### 查看狀態和歷史
\`\`\`bash
# 查看當前更改
git status

# 查看提交歷史
git log --oneline --graph --all

# 查看最近 5 次提交
git log --oneline -5
\`\`\`

### 回滾操作

**回滾到上一個版本(最安全)**
\`\`\`bash
# 查看歷史找到想回滾的版本
git log --oneline

# 回滾(例如回滾到 abc123)
git revert abc123
\`\`\`

**臨時查看舊版本**
\`\`\`bash
git checkout abc123  # 切換到舊版本查看
git checkout master  # 回到最新版本
\`\`\`

**硬回滾(刪除歷史,危險!)**
\`\`\`bash
git reset --hard abc123  # 慎用!
\`\`\`

## GitHub 操作

### 首次設置

1. 在 GitHub 創建倉庫: https://github.com/new

2. 連接本地倉庫:
\`\`\`bash
git remote add origin https://github.com/用戶名/倉庫名.git
git branch -M master
git push -u origin master
\`\`\`

### 日常同步

\`\`\`bash
# 推送到 GitHub
git push

# 從 GitHub 拉取
git pull
\`\`\`

## 分支管理

\`\`\`bash
# 創建並切換到新分支
git checkout -b feature/新功能

# 查看所有分支
git branch -a

# 切換分支
git checkout master

# 合併分支
git merge feature/新功能

# 刪除分支
git branch -d feature/新功能
\`\`\`

## 實用技巧

### 撤銷未提交的更改
\`\`\`bash
# 撤銷所有未提交的更改
git checkout .

# 撤銷特定文件的更改
git checkout -- 文件名
\`\`\`

### 查看更改內容
\`\`\`bash
# 查看未暫存的更改
git diff

# 查看已暫存的更改
git diff --staged

# 查看兩個提交之間的差異
git diff abc123 def456
\`\`\`

### 修改最後一次提交
\`\`\`bash
# 修改提交信息
git commit --amend -m "新的提交信息"

# 添加遺漏的文件到最後一次提交
git add 遺漏的文件
git commit --amend --no-edit
\`\`\`

## 推薦工作流

1. **開始工作前**: `git pull` (如果使用 GitHub)
2. **做更改**: 編輯代碼
3. **測試**: 確保代碼正常運行
4. **提交**: `git add .` → `git commit -m "描述"`
5. **推送**: `git push` (如果使用 GitHub)

## 緊急情況

### 不小心刪除了重要代碼
\`\`\`bash
# 查看哪個提交有你要的代碼
git log --oneline

# 恢復該提交的代碼
git checkout <commit-hash> -- 文件路徑
\`\`\`

### 想放棄所有本地更改
\`\`\`bash
git reset --hard HEAD
\`\`\`

### 找回刪除的提交
\`\`\`bash
# 查看所有操作歷史
git reflog

# 恢復到某個歷史狀態
git reset --hard HEAD@{n}
\`\`\`
