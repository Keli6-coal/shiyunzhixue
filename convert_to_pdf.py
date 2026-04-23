import markdown

# 读取Markdown文件
with open('教学文档.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

# 转换为HTML
html_content = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])

# 添加完整的HTML和CSS样式
full_html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>诗韵智学 - 古诗词互动教学平台 教学文档</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            font-family: 'Microsoft YaHei', 'PingFang SC', 'SimSun', sans-serif;
            line-height: 1.8;
            color: #333;
            padding: 40px;
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
        }}
        h1 {{
            color: #c41a1a;
            border-bottom: 3px solid #c41a1a;
            padding-bottom: 15px;
            font-size: 32px;
            margin-bottom: 30px;
            text-align: center;
        }}
        h2 {{
            color: #c41a1a;
            border-bottom: 2px solid #c41a1a;
            padding-bottom: 10px;
            font-size: 26px;
            margin-top: 40px;
            margin-bottom: 20px;
        }}
        h3 {{
            color: #8B4513;
            font-size: 22px;
            margin-top: 30px;
            margin-bottom: 15px;
        }}
        h4 {{
            color: #666;
            font-size: 18px;
            margin-top: 25px;
            margin-bottom: 12px;
        }}
        p {{
            margin: 12px 0;
            text-indent: 2em;
        }}
        table {{
            border-collapse: collapse;
            width: 100%;
            margin: 25px 0;
            page-break-inside: avoid;
        }}
        th, td {{
            border: 1px solid #ddd;
            padding: 12px 15px;
            text-align: left;
        }}
        th {{
            background-color: #c41a1a;
            color: white;
            font-weight: bold;
        }}
        tr:nth-child(even) {{
            background-color: #f9f9f9;
        }}
        code {{
            background-color: #f5f5f5;
            padding: 2px 8px;
            border-radius: 4px;
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 0.9em;
        }}
        pre {{
            background-color: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 20px 0;
            page-break-inside: avoid;
        }}
        pre code {{
            background: none;
            padding: 0;
        }}
        blockquote {{
            border-left: 4px solid #c41a1a;
            padding: 15px 20px;
            margin: 20px 0;
            color: #666;
            font-style: italic;
            background: #fafafa;
            border-radius: 0 8px 8px 0;
        }}
        blockquote p {{
            text-indent: 0;
        }}
        ul, ol {{
            padding-left: 40px;
            margin: 15px 0;
        }}
        li {{
            margin: 10px 0;
        }}
        hr {{
            border: none;
            border-top: 2px solid #c41a1a;
            margin: 35px 0;
        }}
        strong {{
            color: #333;
            font-weight: bold;
        }}
        a {{
            color: #c41a1a;
            text-decoration: none;
        }}
        a:hover {{
            text-decoration: underline;
        }}
        @media print {{
            body {{
                padding: 20px;
            }}
            h1, h2, h3 {{
                page-break-before: avoid;
            }}
            table, pre, blockquote {{
                page-break-inside: avoid;
            }}
        }}
    </style>
</head>
<body>
{html_content}
</body>
</html>"""

# 保存HTML文件
with open('教学文档.html', 'w', encoding='utf-8') as f:
    f.write(full_html)

print("HTML文件已生成：教学文档.html")
print("请在浏览器中打开此HTML文件，然后使用打印功能（Ctrl+P）保存为PDF")
print("\n或者使用以下Python命令安装wkhtmltopdf后再生成PDF:")
print("pip install pdfkit")
print("然后下载wkhtmltopdf: https://wkhtmltopdf.org/downloads.html")
