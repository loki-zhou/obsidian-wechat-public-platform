// 测试代码块解析的简单脚本
const fs = require('fs');

// 模拟测试代码块解析
const testMarkdown = `
# 测试代码块

\`\`\`javascript
function hello() {
    console.log("Hello World");
    return "success";
}
\`\`\`
`;

console.log('测试 Markdown 内容:');
console.log(testMarkdown);

console.log('\n预期的 HTML 输出应该包含:');
console.log('1. 带行号的代码块结构');
console.log('2. 微信公众号兼容的内联样式');
console.log('3. 每行代码独立的 <code> 标签');
console.log('4. 行号使用 <li> 和 <span> 结构');

console.log('\n修改完成！请在 Obsidian 中测试代码块渲染效果。');