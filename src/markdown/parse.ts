import { Token, Tokens, Marked, options, Lexer, Renderer} from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import {calloutRender} from "./callouts";
import { bgHighlight } from "./bghighlight";

// 中文字符正则表达式
const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\u30a0-\u30ff]/;
const englishRegex = /[a-zA-Z]/;

// 辅助函数，用于对纯文本应用间距逻辑
function applySpacing(text: string): string {
    if (!text) return text;

    // 如果文本很短或者是纯符号，直接返回
    if (text.length < 2 || !/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\u30a0-\u30ffa-zA-Z]/.test(text)) {
        return text;
    }

    let result = '';
    let currentSegment = '';
    let currentType = null; // 'chinese' | 'english' | 'other'

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        let charType = null;

        if (chineseRegex.test(char)) {
            charType = 'chinese';
        } else if (englishRegex.test(char)) {
            charType = 'english';
        } else {
            charType = 'other';
        }

        if (currentType !== null && currentType !== charType && currentSegment) {
            if (currentType === 'chinese') {
                result += `<span class="chinese-text">${currentSegment}</span>`;
            } else if (currentType === 'english') {
                result += `<span class="english-text">${currentSegment}</span>`;
            } else {
                result += currentSegment;
            }
            currentSegment = '';
        }

        currentSegment += char;
        currentType = charType;
    }

    if (currentSegment) {
        if (currentType === 'chinese') {
            result += `<span class="chinese-text">${currentSegment}</span>`;
        } else if (currentType === 'english') {
            result += `<span class="english-text">${currentSegment}</span>`;
        } else {
            result += currentSegment;
        }
    }

    return result;
}

// 处理混合中英文文本的函数（已重构）
function processTextWithLanguageClasses(text: string): string {
    if (!text) return text;

    // 如果包含HTML标签，直接返回避免破坏
    if (text.includes('<') || text.includes('>')) {
        return text;
    }

    // 通过分割HTML实体来分别处理文本和实体
    const parts = text.split(/(&[a-zA-Z0-9#]+;)/g);

    const processedParts = parts.map(part => {
        if (!part) return '';
        // 如果部分是HTML实体，则原样返回
        if (part.startsWith('&') && part.endsWith(';')) {
            return part;
        }
        // 否则，对该部分应用间距逻辑
        return applySpacing(part);
    });

    return processedParts.join('');
}

// HTML转义函数
function escapeHtml(text: string): string {
    const htmlEscapes: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
    };
    
    return text.replace(/[&<>"']/g, (match) => htmlEscapes[match as keyof typeof htmlEscapes]);
}


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
			return `<span data-txt="${token.text}"></span>`;
		}
	}
}

export async function markedParse(content:string, op:ParseOptions, extensions:any[])  {
	parseOptions.lineNumber = op.lineNumber;
	parseOptions.linkStyle = op.linkStyle;

	const m = new Marked();
	AllLinks = [];
	m.use(markedOptiones);

	const renderer = new Renderer();
	
	// 重写文本渲染器来处理中英文
	renderer.text = (text: string) => {
		return processTextWithLanguageClasses(text);
	};
	
	// 重写段落渲染器
	renderer.paragraph = (text: string) => {
		return `<p>${text}</p>\n`;
	};
	
	// 重写标题渲染器
	renderer.heading = (text: string, level: number, raw: string) => {
		return `<h${level}>${text}</h${level}>\n`;
	};
	
	// 重写列表项渲染器
	renderer.listitem = (text: string) => {
		return `<li section>${text}</li>\n`;
	};
	
	renderer.code = (code: string, lang: string | undefined, escaped: boolean | undefined) => {
		let highlightedCode = code;
		const language = lang || 'js';
		if (language && hljs.getLanguage(language)) {
			try {
				highlightedCode = hljs.highlight(code, { language: language }).value;
			} catch (err) {
				console.error('代码高亮失败:', err);
				highlightedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
			}
		} else {
			highlightedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		}
		highlightedCode = highlightedCode.replace(/&#x27;/g, "'");

		const lines = highlightedCode.split('\n');
		const lineNumbers: string[] = [];
		const codeLines: string[] = [];

		lines.forEach((line: string, index: number) => {
			if (index < lines.length - 1 || line.trim() !== '') {
				lineNumbers.push(`<li style="list-style-type: none; text-align: right; line-height: 26px; color: black; margin: 0;"><span style="min-width: 1.5em; text-align: right; left: -2.5em; counter-increment: line; display: inline; color: rgba(0,0,0,0.3);"></span></li>`);
				
				let processedLine = line.replace(/(\s)(?![^<]*>)/g, "&nbsp;");
				if (!processedLine || processedLine.trim() === "") {
					processedLine = "&nbsp;";
				}
				codeLines.push(`<code style="border-radius: 0px; -webkit-overflow-scrolling: touch; text-align: left; display: block; white-space: pre; display: flex; position: relative; font-family: Monaco, Consolas, 'Liberation Mono', Menlo, Courier, monospace; padding: 0px;"><span class="code-snippet_outer" style="line-height: 26px;">${processedLine}</span></code>`);
			}
		});

		return `<section class="code-snippet__fix code-snippet__js" data-tool="markdown.com.cn编辑器" style="margin: 10px 0; display: block; color: #333; position: relative; background-color: rgba(0,0,0,0.03); border: 1px solid #f0f0f0; border-radius: 2px; display: flex; line-height: 20px; word-wrap: break-word !important;">
			<ul class="code-snippet__line-index code-snippet__js" style="margin-top: 8px; margin-bottom: 8px; padding-left: 25px; color: black; counter-reset: line; flex-shrink: 0; height: 100%; padding: 1em; list-style-type: none; padding: 16px; margin: 0;">
				${lineNumbers.join('')}
			</ul>
			<pre class="code-snippet__js" data-lang="${language}" style="margin-bottom: 10px; margin-top: 0px; overflow-x: auto; padding: 16px; padding-left: 0; white-space: normal; flex: 1; -webkit-overflow-scrolling: touch;">
				${codeLines.join('')}
			</pre>
		</section>`;
	};

	m.use({
		renderer,
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

	const html = await m.parse(content);
	if (parseOptions.linkStyle == 'footnote') {
	    return html + footnoteLinks();
	}
	return html;
}
