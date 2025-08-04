const { Marked } = require("marked");
const { markedHighlight } = require("marked-highlight");
const hljs = require("highlight.js");
const fs = require("fs");

// 模拟当前的代码逻辑
function createTestHTML(markdownContent) {
    const m = new Marked(
        markedHighlight({
            highlight(code, lang, info) {
                // 先按行分割原始代码，保持原有格式
                const originalLines = code.split("\n");
                
                // 进行语法高亮
                let highlightedCode = code;
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        const result = hljs.highlight(code, { language: lang });
                        highlightedCode = result.value;
                    } catch (err) {
                        console.warn('语法高亮失败:', err);
                        highlightedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    }
                } else {
                    highlightedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                }
                
                // 按行分割高亮后的代码
                const highlightedLines = highlightedCode.split("\n");
                
                // 为微信公众号优化的代码块格式，保持原有的空格和缩进
                const codeLines = [];
                for (let i = 0; i < originalLines.length; i++) {
                    const originalLine = originalLines[i];
                    const highlightedLine = highlightedLines[i] || originalLine.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    
                    if (originalLine !== undefined && (i < originalLines.length - 1 || originalLine.trim() !== "")) {
                    // 正确处理空格：只替换HTML标签外的空格，保持标签内的属性完整
                    let processedLine = highlightedLine;
                    
                    // 使用正则表达式，只替换不在HTML标签内的空格
                    processedLine = processedLine.replace(/(\s)(?![^<]*>)/g, "&nbsp;");
                    
                    // 如果行为空，至少显示一个空格
                    if (!processedLine || processedLine.trim() === "") {
                        processedLine = "&nbsp;";
                    }
                        codeLines.push(`<div style="margin: 0; padding: 0; line-height: 1.5; min-height: 21px;">${processedLine}</div>`);
                    }
                }
                
                // 使用微信兼容的HTML结构和内联样式
                return `<div style="background-color: #282c34; color: #abb2bf; padding: 16px; border-radius: 5px; margin: 10px 0; font-family: 'Courier New', Consolas, Monaco, monospace; font-size: 14px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; border: 1px solid #3e4451;">
                    ${codeLines.join('')}
                </div>`;
            }
        })
    );

    m.use({
        gfm: true,
        breaks: true,
    });

    return m.parse(markdownContent);
}

// 读取CSS样式
const customCSS = `
/* 语法高亮样式 - 适配深色背景 */
.hljs-keyword {
  color: #c678dd !important;
}

.hljs-string {
  color: #98c379 !important;
}

.hljs-comment {
  color: #5c6370 !important;
  font-style: italic !important;
}

.hljs-number {
  color: #d19a66 !important;
}

.hljs-built_in,
.hljs-name {
  color: #e5c07b !important;
}

.hljs-function .hljs-title {
  color: #61aeee !important;
}

.hljs-variable {
  color: #e06c75 !important;
}

.hljs-title {
  color: #61aeee !important;
}

/* 行内代码 */
code {
  color: #009688;
  background-color: #f0f8f8;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', Consolas, Monaco, monospace;
  font-size: 14px;
  border: 1px solid #b2dfdb;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
}

h1, h2, h3 {
  color: #009688;
}

h1 {
  border-bottom: 1px solid #009688;
  padding-bottom: 10px;
}

h2 {
  border-left: 3px solid #009688;
  padding-left: 10px;
}

h3 {
  border-left: 2px solid #009688;
  padding-left: 10px;
}
`;

// 测试用的 Markdown 内容
const testMarkdown = `# 规模性

可以说编程的本质，是控制复杂度。代码的规模的膨胀就是复杂度的最大根源。

\`\`\`python
def hello():
    print("Hello, world!")
\`\`\`

这是一个简单的 Python 函数示例。

## 其他语言示例

\`\`\`javascript
function greet(name) {
    console.log(\`Hello, \${name}!\`);
    return true;
}
\`\`\`

行内代码示例：\`console.log()\` 是 JavaScript 中的输出函数。
`;

// 生成HTML
async function generateTestHTML(markdown = testMarkdown) {
    const htmlContent = await createTestHTML(markdown);
    
    const fullHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown 测试预览</title>
    <style>
        ${customCSS}
    </style>
</head>
<body>
    <div id="nice">
        ${htmlContent}
    </div>
</body>
</html>
    `;
    
    fs.writeFileSync('test-preview.html', fullHTML);
    console.log('✅ HTML 文件已生成: test-preview.html');
    console.log('📝 请在浏览器中打开查看效果');
    
    return fullHTML;
}

// 如果直接运行此脚本
if (require.main === module) {
    generateTestHTML().catch(console.error);
}

module.exports = { generateTestHTML, createTestHTML };