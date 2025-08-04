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
            const text = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const lines = text.split("\n");
            
            // 为微信公众号优化的代码块格式
            const codeLines = [];
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line !== undefined && (i < lines.length - 1 || line.trim() !== "")) {
                    codeLines.push(`<div style="margin: 0; padding: 0; line-height: 1.5; min-height: 21px;">${line || "&nbsp;"}</div>`);
                }
            }
            
            // 使用微信兼容的HTML结构和内联样式，移除多余的语言标签
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