// 模拟当前代码逻辑生成HTML的测试脚本
const fs = require('fs');

// 读取测试markdown文件
const testMarkdown = fs.readFileSync('test-code-block.md', 'utf8');

// 模拟highlight.js的高亮功能
function mockHighlight(code, lang) {
    // 简单的语法高亮模拟
    let highlighted = code;
    
    if (lang === 'javascript') {
        highlighted = code
            .replace(/\b(function|const|let|var|if|return|console)\b/g, '<span style="color: #0000ff;">$1</span>')
            .replace(/\b(log|greetUser)\b/g, '<span style="color: #795548;">$1</span>')
            .replace(/'([^']*)'/g, '<span style="color: #008000;">\'$1\'</span>')
            .replace(/`([^`]*)`/g, '<span style="color: #008000;">`$1`</span>')
            .replace(/\/\/.*$/gm, '<span style="color: #808080;">$&</span>');
    } else if (lang === 'python') {
        highlighted = code
            .replace(/\b(def|if|return|for|in|range|print)\b/g, '<span style="color: #0000ff;">$1</span>')
            .replace(/\b(calculate_fibonacci|fibonacci)\b/g, '<span style="color: #795548;">$1</span>')
            .replace(/"([^"]*)"/g, '<span style="color: #008000;">"$1"</span>')
            .replace(/f"([^"]*)"/g, '<span style="color: #008000;">f"$1"</span>')
            .replace(/#.*$/gm, '<span style="color: #808080;">$&</span>');
    } else if (lang === 'html') {
        highlighted = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/&lt;(\/?[a-zA-Z][^&gt;]*)&gt;/g, '<span style="color: #0000ff;">&lt;$1&gt;</span>')
            .replace(/(\w+)=/g, '<span style="color: #ff0000;">$1</span>=')
            .replace(/"([^"]*)"/g, '<span style="color: #008000;">"$1"</span>');
    }
    
    return highlighted;
}

// 模拟代码块渲染函数
function renderCodeBlock(code, lang) {
    // 先按行分割原始代码，保持原有格式
    const originalLines = code.split("\n");
    
    // 进行语法高亮
    let highlightedCode = mockHighlight(code, lang);
    
    // 按行分割高亮后的代码
    const highlightedLines = highlightedCode.split("\n");
    
    // 生成行号列表
    const lineNumbers = [];
    const codeLines = [];
    
    for (let i = 0; i < originalLines.length; i++) {
        const originalLine = originalLines[i];
        const highlightedLine = highlightedLines[i] || originalLine.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        
        if (originalLine !== undefined && (i < originalLines.length - 1 || originalLine.trim() !== "")) {
            // 添加行号
            lineNumbers.push(`<li style="list-style-type: none; text-align: right; line-height: 26px; color: black; margin: 0;"><span style="min-width: 1.5em; text-align: right; left: -2.5em; counter-increment: line; display: inline; color: rgba(0,0,0,0.3);">${i + 1}</span></li>`);
            
            // 处理代码行
            let processedLine = highlightedLine;
            
            // 使用正则表达式，只替换不在HTML标签内的空格
            processedLine = processedLine.replace(/(\s)(?![^<]*>)/g, "&nbsp;");
            
            // 如果行为空，至少显示一个空格
            if (!processedLine || processedLine.trim() === "") {
                processedLine = "&nbsp;";
            }
            
            codeLines.push(`<code style="border-radius: 0px; -webkit-overflow-scrolling: touch; text-align: left; font-size: 14px; display: block; white-space: pre; display: flex; position: relative; font-family: Consolas,'Liberation Mono',Menlo,Courier,monospace; padding: 0px;"><span class="code-snippet_outer" style="line-height: 26px;">${processedLine}</span></code>`);
        }
    }
    
    // 使用微信兼容的HTML结构
    return `<section class="code-snippet__fix code-snippet__js" data-tool="markdown.com.cn编辑器" style="font-size: 14px; margin: 10px 0; display: block; color: #333; position: relative; background-color: rgba(0,0,0,0.03); border: 1px solid #f0f0f0; border-radius: 2px; display: flex; line-height: 20px; word-wrap: break-word !important;">
        <ul class="code-snippet__line-index code-snippet__js" style="margin-top: 8px; margin-bottom: 8px; padding-left: 25px; color: black; counter-reset: line; flex-shrink: 0; height: 100%; padding: 1em; list-style-type: none; padding: 16px; margin: 0;">
            ${lineNumbers.join('')}
        </ul>
        <pre class="code-snippet__js" data-lang="${lang || ''}" style="margin-bottom: 10px; margin-top: 0px; overflow-x: auto; padding: 16px; padding-left: 0; white-space: normal; flex: 1; -webkit-overflow-scrolling: touch;">
            ${codeLines.join('')}
        </pre>
    </section>`;
}

// 简单的markdown解析，提取代码块
function parseMarkdownCodeBlocks(markdown) {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    let html = markdown;
    
    while ((match = codeBlockRegex.exec(markdown)) !== null) {
        const lang = match[1] || '';
        const code = match[2];
        const renderedCode = renderCodeBlock(code, lang);
        html = html.replace(match[0], renderedCode);
    }
    
    // 简单处理其他markdown元素
    html = html
        .replace(/^# (.*$)/gm, '<h1 style="font-size: 24px; font-weight: bold; margin: 20px 0 10px 0;">$1</h1>')
        .replace(/^## (.*$)/gm, '<h2 style="font-size: 20px; font-weight: bold; margin: 16px 0 8px 0;">$1</h2>')
        .replace(/^\n/gm, '<br>')
        .replace(/^(?!<[h|s|u])(.*$)/gm, '<p style="margin: 8px 0; line-height: 1.6;">$1</p>');
    
    return html;
}

// 生成完整的HTML文档
const parsedHtml = parseMarkdownCodeBlocks(testMarkdown);

const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>微信公众号代码块测试</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        /* 微信公众号兼容的带行号代码块样式 */
        .code-snippet__fix {
            font-size: 14px !important;
            margin: 10px 0 !important;
            display: block !important;
            color: #333 !important;
            position: relative !important;
            background-color: rgba(0,0,0,0.03) !important;
            border: 1px solid #f0f0f0 !important;
            border-radius: 2px !important;
            display: flex !important;
            line-height: 20px !important;
            word-wrap: break-word !important;
        }

        .code-snippet__line-index {
            margin-top: 8px !important;
            margin-bottom: 8px !important;
            padding-left: 25px !important;
            color: black !important;
            counter-reset: line !important;
            flex-shrink: 0 !important;
            height: 100% !important;
            padding: 16px !important;
            margin: 0 !important;
            list-style-type: none !important;
        }

        .code-snippet__line-index li {
            list-style-type: none !important;
            text-align: right !important;
            line-height: 26px !important;
            color: black !important;
            margin: 0 !important;
        }

        .code-snippet__line-index li span {
            min-width: 1.5em !important;
            text-align: right !important;
            left: -2.5em !important;
            counter-increment: line !important;
            display: inline !important;
            color: rgba(0,0,0,0.3) !important;
        }

        .code-snippet__js {
            margin-bottom: 10px !important;
            margin-top: 0px !important;
            overflow-x: auto !important;
            padding: 16px !important;
            padding-left: 0 !important;
            white-space: normal !important;
            flex: 1 !important;
            -webkit-overflow-scrolling: touch !important;
        }

        .code-snippet__js code {
            border-radius: 0px !important;
            -webkit-overflow-scrolling: touch !important;
            text-align: left !important;
            font-size: 14px !important;
            display: block !important;
            white-space: pre !important;
            display: flex !important;
            position: relative !important;
            font-family: Consolas,'Liberation Mono',Menlo,Courier,monospace !important;
            padding: 0px !important;
        }

        .code-snippet_outer {
            line-height: 26px !important;
        }
    </style>
</head>
<body>
    <div class="container">
        <section id="nice" data-tool="markdown编辑器" data-website="https://markdown.com.cn/editor" style="font-size: 16px; color: black; padding: 25px 30px; line-height: 1.6; word-spacing: 0px; letter-spacing: 0px; word-break: break-word; word-wrap: break-word; text-align: justify; font-family: Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; margin-top: -10px;">
            ${parsedHtml}
        </section>
    </div>
</body>
</html>`;

// 保存HTML文件
fs.writeFileSync('test-output.html', fullHtml, 'utf8');

console.log('HTML文件已生成: test-output.html');
console.log('你可以在浏览器中打开这个文件查看效果');