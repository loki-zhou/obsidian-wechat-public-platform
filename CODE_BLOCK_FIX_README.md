# 微信公众号代码块丢失问题修复说明

## 问题描述

在使用 Obsidian 微信公众号插件上传文章到微信公众号草稿时，Markdown 中的代码块经常会丢失或显示异常。

## 问题原因分析

1. **HTML 结构过于复杂**：原始的代码块转换生成了复杂的 HTML 结构，微信编辑器无法正确解析
2. **CSS 样式不兼容**：使用了微信编辑器不支持的 CSS 属性和选择器
3. **代码块移除逻辑**：`removeWeChatPreCode` 函数直接移除了代码块标签，导致内容丢失
4. **特殊字符处理不当**：HTML 特殊字符没有正确转义

## 修复方案

### 1. 优化代码块 HTML 生成逻辑

**文件**: `src/markdown/parse.ts`

- 将复杂的代码块结构简化为微信兼容的 `<div>` 结构
- 使用内联样式替代外部 CSS 类
- 确保所有样式都是微信编辑器支持的属性

```javascript
// 修复前：复杂的 HTML 结构
'<section class="code-snippet__fix code-snippet__js">' +
'<ul class="code-snippet__line-index code-snippet__js">' +
numbers.join("") +
"</ul>" +
'<pre class="code-snippet__js" data-lang="' +
lang +
'">' +
codeLines.join("") +
"</pre></section>"

// 修复后：简化的微信兼容结构
`<div style="background-color: #282c34; color: #abb2bf; padding: 16px; border-radius: 5px; margin: 10px 0; font-family: 'Courier New', Consolas, Monaco, monospace; font-size: 14px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;">
    <div style="color: #61aeee; font-size: 12px; margin-bottom: 8px; opacity: 0.8;">${lang || 'code'}</div>
    ${codeLines.join('')}
</div>`
```

### 2. 重构代码块处理函数

**文件**: `src/markdown/code.ts`

- 将 `removeWeChatPreCode` 重命名为 `weChatCodeBlockOptimizer`
- 改变逻辑从"移除代码块"到"优化代码块格式"
- 添加适当的 HTML 转义处理

```javascript
// 修复前：直接移除代码块
renderer(token: Tokens.Generic) {
    return token.content; // Remove the <pre><code> and </code></pre> tags
}

// 修复后：转换为微信兼容格式
renderer(token: Tokens.Generic) {
    const content = token.content
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    
    return `<div class="wechat-code-block" style="...">${content}</div>`;
}
```

### 3. 更新 CSS 样式

**文件**: `src/style/codeStyle.ts`

- 使用 `!important` 确保样式优先级
- 添加微信编辑器兼容的样式规则
- 简化语法高亮颜色，避免过于复杂的样式

### 4. 优化代码格式化函数

**文件**: `src/api.ts`

- 改进 `formatCodeHTML` 函数的处理逻辑
- 区分行内代码和代码块的处理方式
- 确保空行和特殊字符的正确处理

## 修复效果

### 修复前的问题
- ❌ 代码块在微信编辑器中完全消失
- ❌ 代码格式混乱，缩进丢失
- ❌ 特殊字符显示异常
- ❌ 语法高亮不生效

### 修复后的改进
- ✅ 代码块在微信编辑器中正常显示
- ✅ 保持原有的代码格式和缩进
- ✅ 特殊字符正确转义显示
- ✅ 基础语法高亮效果保留
- ✅ 支持长代码行的自动换行
- ✅ 行内代码和代码块都能正常显示

## 测试方法

1. 使用提供的 `test-code-blocks.md` 文件进行测试
2. 通过插件上传到微信公众号草稿
3. 检查各种类型的代码块是否正常显示

## 兼容性说明

- ✅ 微信公众号编辑器
- ✅ 微信文章预览
- ✅ 移动端微信阅读
- ✅ 桌面端微信阅读
- ✅ 保持与原有功能的向后兼容

## 注意事项

1. **样式限制**：微信编辑器对 CSS 支持有限，复杂的样式可能被过滤
2. **字体限制**：微信可能不支持所有字体，建议使用系统默认等宽字体
3. **长度限制**：过长的代码行会自动换行，建议适当控制代码行长度
4. **特殊字符**：HTML 特殊字符会被自动转义，确保正确显示

## 后续优化建议

1. **代码块图片化**：对于复杂的代码块，可以考虑转换为图片
2. **主题定制**：允许用户自定义代码块的颜色主题
3. **语言检测**：自动检测代码语言并应用相应的高亮规则
4. **性能优化**：对大量代码块的文章进行处理性能优化

## 更新日志

- **v1.1.0**: 修复微信公众号代码块丢失问题
- 优化代码块 HTML 生成逻辑
- 重构代码块处理函数
- 更新 CSS 样式以确保微信兼容性
- 改进代码格式化函数