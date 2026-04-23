# 诗韵智学 - 古诗词互动学习平台

一个纯静态的古诗词学习网站，包含73,000+首唐宋诗词，支持搜索、赏析、飞花令、题库练习等功能。

## 在线访问

访问 GitHub Pages: https://你的用户名.github.io/仓库名/

## 功能特色

- 📚 **诗词库** - 73,000+首唐宋诗词，支持按朝代、体裁筛选
- 🔍 **全文搜索** - 支持标题、作者、内容搜索
- 📖 **诗词赏析** - 包含译文、注释、创作背景
- 🎮 **飞花令** - 经典诗词互动游戏
- 📝 **题库练习** - 填空、排序等多种题型
- 📱 **响应式设计** - 完美支持手机和电脑访问

## 本地运行

```bash
# 使用 Python 启动本地服务器
cd awngye
python -m http.server 8080

# 访问 http://localhost:8080
```

## 部署到 GitHub Pages

1. 创建 GitHub 仓库
2. 推送代码：
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M main
git push -u origin main
```
3. 在仓库设置中启用 GitHub Pages (Settings > Pages > Source: main branch)

## 项目结构

```
awngye/
├── index.html              # 主页面
├── static/
│   ├── data/
│   │   ├── poems.min.json  # 压缩版诗词数据
│   │   ├── poems.json      # 完整诗词数据
│   │   ├── 唐.json         # 唐诗数据
│   │   └── 宋.json         # 宋词数据
│   └── index.html          # 备用页面
└── .gitignore
```

## 技术栈

- 纯 HTML/CSS/JavaScript
- 本地 JSON 数据存储
- 无需后端服务器

## 许可证

MIT License
