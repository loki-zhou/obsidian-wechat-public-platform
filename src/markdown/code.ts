import { marked, Renderer, Token, Tokens, Lexer } from "marked";

const preReg = /<pre><code[\w\s-="]*>/;

export function weChatCodeBlockOptimizer() {
    return {
        name: 'WeChatCodeBlockOptimizer',
        level: 'block',
        start(src: string) {
            const index = src.indexOf('<pre><code');
            return index === -1 ? undefined : index;
        },
        tokenizer(src: string, tokens: Token[]) {
            const match = src.match(preReg);
            if (match) {
                const endIndex = src.indexOf('</code></pre>', match.index!);
                if (endIndex !== -1) {
                    return {
                        type: 'WeChatCodeBlockOptimizer',
                        raw: src.slice(match.index!, endIndex + '</code></pre>'.length),
                        pre: match[0],
                        content: src.slice(match.index! + match[0].length, endIndex),
                        post: '</code></pre>',
                    };
                }
            }
        },
        renderer(token: Tokens.Generic) {
            // 将代码块转换为微信兼容的格式，而不是移除
            const content = token.content
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            
            return `<div class="wechat-code-block" style="background-color: #f8f9fa; border: 1px solid #e1e8ed; border-radius: 5px; padding: 12px; margin: 10px 0; font-family: 'Courier New', Consolas, Monaco, monospace; font-size: 14px; line-height: 1.4; color: #333333; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;">${content}</div>`;
        }
    }
}

// 保持向后兼容
export function removeWeChatPreCode() {
    return weChatCodeBlockOptimizer();
}

// 使用示例
// marked.use({ extensions: [removeWeChatPreCode()] });

// 示例转换
// const markdownContent = `
// <pre><code class="language-js">console.log('Hello, world!');</code></pre>
// `;
// const htmlContent = marked(markdownContent);
// console.log(htmlContent); // 输出: console.log('Hello, world!');