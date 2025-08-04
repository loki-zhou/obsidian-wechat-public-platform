import { Token, Tokens, Marked, options, Lexer} from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import {calloutRender} from "./callouts";
import { bgHighlight } from "./bghighlight";


export interface ParseOptions {
    lineNumber: boolean;
	linkStyle: 'footnote' | 'inline';
};

const BlockMarkRegex = /^\^[0-9A-Za-z-]+$/;
let AllLinks:string[] = [];

const parseOptions:ParseOptions = {
    lineNumber: true,
	linkStyle: 'footnote'
};
const markedOptiones = {
    gfm: true,
    breaks: true,
};

function footnoteLinks() {
	if (AllLinks.length == 0) {
	    return '';
	}
	
	const links = AllLinks.map((href, i) => {
		return `<li>${href}&nbsp;↩</li>`;
	});
	return `<seciton class="footnotes"><hr><ol>${links.join('')}</ol></section>`;
}

function EmbedBlockMark() {
	return {
		name: 'EmbedBlockMark',
		level: 'inline',
		start(src: string) {
			let index = src.indexOf('^');
			if (index === -1) {
			    return;
			}
			return index;
		},
		tokenizer(src: string, tokens: Token[]) {
			const match = src.match(BlockMarkRegex);
			if (match) {
				return {
					type: 'EmbedBlockMark',
					raw: match[0],
					text: match[0]
				};
			}
		},
		renderer: (token: Tokens.Generic) => {
			return `<span data-txt="${token.text}"></span}`;
		}
	}
}

export async function markedParse(content:string, op:ParseOptions, extensions:any[])  {
	parseOptions.lineNumber = op.lineNumber;
	parseOptions.linkStyle = op.linkStyle;

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
	AllLinks = [];
	m.use(markedOptiones);
	m.use({
		extensions: [
		{
			name: 'blockquote',
			level: 'block',
			renderer(token) {
				return calloutRender.call(this, token as Tokens.Blockquote);
			}, 
		},
		bgHighlight(),
		EmbedBlockMark(),
		... extensions
	]});

	const renderer = {
		
	};
	m.use({renderer});
	const html = await m.parse(content);
	if (parseOptions.linkStyle == 'footnote') {
	    return html + footnoteLinks();
	}
	return html;
}