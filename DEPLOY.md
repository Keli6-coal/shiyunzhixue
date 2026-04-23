# 诗韵智学 - 静态网站部署指南

## 项目结构

```
awngye/
├── index.html              # 主页面
├── .gitignore              # Git忽略文件
└── static/
    ├── index.html          # 备用主页
    └── data/
        ├── poems.json      # 完整诗词数据 (73181首)
        ├── search_index.json  # 搜索索引
        ├── index.json      # 数据索引
        ├── 唐.json         # 唐诗数据
        └── 宋.json         # 宋词数据
```

## 部署方案

### 方案一：GitHub Pages (推荐)

#### 步骤1：安装 Git
1. 访问 https://git-scm.com/download/win
2. 下载并安装 Git for Windows
3. 安装时保持默认设置即可

#### 步骤2：创建 GitHub 仓库
1. 访问 https://github.com/new
2. 仓库名：`shiyun-zhixue` (或其他名称)
3. 设置为 Public (公开)
4. 不要初始化 README

#### 步骤3：推送代码
打开命令提示符或 PowerShell，执行：

```bash
cd a:\trae\唐宋诗词\awngye

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 诗韵智学静态网站"

# 关联远程仓库 (替换为你的仓库地址)
git remote add origin https://github.com/你的用户名/shiyun-zhixue.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

#### 步骤4：启用 GitHub Pages
1. 进入仓库设置：Settings > Pages
2. Source 选择 "Deploy from a branch"
3. Branch 选择 "main"，文件夹选择 "/ (root)"
4. 点击 Save

#### 步骤5：访问网站
等待几分钟部署完成后，访问：
`https://你的用户名.github.io/shiyun-zhixue/`

---

### 方案二：使用 GitHub Desktop (图形界面)

1. 下载 GitHub Desktop：https://desktop.github.com/
2. 安装并登录 GitHub 账号
3. 点击 "Add an Existing Repository"
4. 选择 `a:\trae\唐宋诗词\awngye` 文件夹
5. 点击 "Create a repository"
6. 填写仓库信息并点击 "Publish repository"
7. 在仓库设置中启用 GitHub Pages

---

### 方案三：使用 Vercel (自动部署)

1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 导入你的 GitHub 仓库
5. Vercel 会自动检测并部署静态网站
6. 获得免费的 vercel.app 域名

---

### 方案四：使用 Netlify

1. 访问 https://netlify.com
2. 注册账号
3. 拖拽 `awngye` 文件夹到 Netlify 部署页面
4. 自动获得免费的 netlify.app 域名

---

## 注意事项

### 数据文件大小
- `poems.json` 约 33MB，GitHub 单个文件限制为 100MB
- 如果加载缓慢，可以考虑：
  1. 使用 CDN 加速
  2. 实现按需加载（按朝代加载）
  3. 压缩 JSON 文件

### 压缩 JSON 文件 (可选)
```bash
# 使用 Python 压缩
python -c "import json; data=json.load(open('static/data/poems.json','r',encoding='utf-8')); json.dump(data,open('static/data/poems.min.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))"
```

### 本地测试
在部署前，可以本地测试：
```bash
# 使用 Python 启动本地服务器
cd a:\trae\唐宋诗词\awngye
python -m http.server 8080

# 访问 http://localhost:8080
```

---

## 常见问题

**Q: GitHub Pages 加载慢怎么办？**
A: 可以使用 jsDelivr CDN 加速：
`https://cdn.jsdelivr.net/gh/你的用户名/仓库名@main/static/data/poems.json`

**Q: 如何自定义域名？**
A: 在 GitHub Pages 设置中添加自定义域名，并配置 DNS。

**Q: 数据更新后如何同步？**
A: 修改数据后，执行 `git add . && git commit -m "更新数据" && git push`
