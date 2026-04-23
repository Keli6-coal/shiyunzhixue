@echo off
chcp 65001 >nul
echo ========================================
echo    诗韵智学 - GitHub 自动部署脚本
echo ========================================
echo.

cd /d a:\trae\唐宋诗词\awngye

echo [1/5] 检查 Git 是否安装...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ 错误：未检测到 Git！
    echo.
    echo 请先安装 Git：
    echo 1. 访问 https://git-scm.com/download/win
    echo 2. 下载并安装
    echo 3. 重新运行此脚本
    echo.
    pause
    exit /b 1
)
echo ✓ Git 已安装

echo.
echo [2/5] 初始化 Git 仓库...
if not exist .git (
    git init
    echo ✓ 仓库已初始化
) else (
    echo ✓ 仓库已存在
)

echo.
echo [3/5] 添加所有文件...
git add .
echo ✓ 文件已添加

echo.
echo [4/5] 提交更改...
git commit -m "诗韵智学静态网站 - 73000+首古诗词"
echo ✓ 提交完成

echo.
echo ========================================
echo [5/5] 推送到 GitHub
echo ========================================
echo.
echo 请输入你的 GitHub 仓库地址：
echo 格式：https://github.com/用户名/仓库名.git
echo.
set /p REPO_URL=仓库地址：

if "%REPO_URL%"=="" (
    echo.
    echo ❌ 错误：仓库地址不能为空！
    pause
    exit /b 1
)

echo.
echo 正在关联远程仓库...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo 正在推送到 GitHub...
echo （首次推送会弹出浏览器进行授权，请按提示操作）
echo.
git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✓ 部署成功！
    echo ========================================
    echo.
    echo 接下来请启用 GitHub Pages：
    echo 1. 访问你的仓库页面
    echo 2. 点击 Settings ^> Pages
    echo 3. Source 选择 Deploy from a branch
    echo 4. Branch 选择 main，文件夹选择 / (root)
    echo 5. 点击 Save
    echo.
    echo 你的网站将在几分钟后上线！
) else (
    echo.
    echo ❌ 推送失败！
    echo.
    echo 可能的原因：
    echo 1. 仓库地址错误
    echo 2. 没有推送权限
    echo 3. 网络连接问题
    echo.
    echo 请检查后重试
)

echo.
pause
