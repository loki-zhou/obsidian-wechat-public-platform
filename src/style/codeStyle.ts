export const codeStyle = `/*
微信公众号兼容的代码样式
优化后的样式确保在微信编辑器中正确显示
*/

/* 行内代码样式 - 微信兼容 */
#nice p code, 
#nice li code {
  color: #e74c3c !important;
  background-color: #f8f9fa !important;
  padding: 2px 6px !important;
  border-radius: 3px !important;
  font-family: 'Courier New', Consolas, Monaco, monospace !important;
  font-size: 14px !important;
  border: 1px solid #e1e8ed !important;
}

/* 代码块容器样式 - 微信兼容 */
#nice pre {
  background-color: #282c34 !important;
  color: #abb2bf !important;
  padding: 16px !important;
  border-radius: 5px !important;
  margin: 15px 0 !important;
  font-family: 'Courier New', Consolas, Monaco, monospace !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  overflow-x: auto !important;
  white-space: pre-wrap !important;
  word-wrap: break-word !important;
  border: 1px solid #3e4451 !important;
}

#nice pre code {
  background: transparent !important;
  color: inherit !important;
  padding: 0 !important;
  border: none !important;
  font-size: inherit !important;
  font-family: inherit !important;
  display: block !important;
}

/* 代码块语言标签 */
#nice .code-lang-label {
  color: #61aeee !important;
  font-size: 12px !important;
  margin-bottom: 8px !important;
  opacity: 0.8 !important;
  font-weight: normal !important;
}

/* 代码行样式 */
#nice .code-line {
  margin: 0 !important;
  padding: 0 !important;
  line-height: 1.5 !important;
  display: block !important;
}

/* 语法高亮颜色 - 简化版本确保微信兼容 */
#nice .hljs-comment,
#nice .hljs-quote {
  color: #5c6370 !important;
  font-style: italic !important;
}

#nice .hljs-keyword,
#nice .hljs-selector-tag,
#nice .hljs-type {
  color: #c678dd !important;
}

#nice .hljs-string,
#nice .hljs-attr {
  color: #98c379 !important;
}

#nice .hljs-number,
#nice .hljs-literal {
  color: #d19a66 !important;
}

#nice .hljs-title,
#nice .hljs-function {
  color: #61aeee !important;
}

#nice .hljs-variable,
#nice .hljs-name {
  color: #e06c75 !important;
}

/* 确保代码块在微信中不被过滤 */
#nice .wechat-code-block {
  background-color: #f8f9fa !important;
  border: 1px solid #e1e8ed !important;
  border-radius: 5px !important;
  padding: 12px !important;
  margin: 10px 0 !important;
  font-family: 'Courier New', Consolas, Monaco, monospace !important;
  font-size: 14px !important;
  line-height: 1.4 !important;
  color: #333333 !important;
  overflow-x: auto !important;
  white-space: pre-wrap !important;
  word-wrap: break-word !important;
}`;
