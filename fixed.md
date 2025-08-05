# 代码块渲染问题修复总结

## 问题描述

在将 Markdown 转换为用于微信公众号的 HTML 时，代码块的渲染出现了严重问题。主要表现为：

1.  在最终的 HTML 中，每个代码块都会多出一个错误的“垃圾节点”，其内容为所有行号的拼接，例如：`&lt;code&gt;&lt;span leaf=""&gt;&lt;span class="code-snippet__number"&gt;123456789...&lt;/span&gt;&lt;/span&gt;&lt;/code&gt;`。
2.  这导致了代码块在微信编辑器中格式混乱，无法正确显示。

## 排查过程

我们通过一系列的排查步骤来定位问题：

1.  **检查 Markdown 解析器 (`marked`)**：最初怀疑是 `marked` 的配置或扩展问题。我们重构了 `src/markdown/parse.ts` 中的代码块渲染逻辑，从使用 `markedHighlight` 插件改为使用完全自定义的 `renderer.code` 函数。这使得生成的 HTML 结构更加精确可控，但并未解决根本问题。

2.  **审查冲突扩展**：我们发现并禁用了 `src/markdown/code.ts` 中一个可能产生冲突的旧扩展 (`weChatCodeBlockOptimizer`)，但问题依旧存在。

3.  **分析调用链**：通过检查 `main.ts` 和 `src/api.ts`，我们理清了从插件命令到最终 HTML 生成的完整调用流程，确认了 `markedParse` 函数被正确调用。

4.  **排除 CSS 干扰**：我们检查了 `custom.css` 和 `src/style/codeStyle.ts` 等所有相关的样式文件，确认其中不包含任何能够生成内容的 CSS 规则（如 `::before` 伪元素），从而排除了 CSS 是问题根源的可能性。

5.  **定位关键环节 (`juice`)**：在排除了上述所有可能性后，我们将焦点放在了 HTML 后处理环节。在 `src/api.ts` 的 `solveHTML` 函数中，我们发现生成的 HTML 会经过一个名为 `juice` 的库进行处理，该库用于将 CSS 样式内联到 HTML 标签中。通过**暂时禁用 `juice`** 进行测试，我们发现那个“垃圾节点”**消失了**。

## 问题根源

问题的根本原因在于 **`juice` 库**。

`juice` 在尝试解析 HTML 并内联 CSS 样式的过程中，无法正确处理我们为代码块生成的、具有复杂嵌套结构的 HTML。它错误地重写了这部分 HTML，破坏了其原有结构，并产生了那个错误的“垃圾节点”。

## 最终解决方案

既然不能完全禁用 `juice` (因为内联 CSS 对公众号文章的样式至关重要)，我们采取了一种“保护”代码块的策略：

1.  在 `src/api.ts` 的 `solveHTML` 函数中，我们修改了逻辑。
2.  在将 HTML 传递给 `juice` **之前**，我们使用正则表达式将所有代码块的 HTML (`&lt;section class="code-snippet__fix..."&gt;...&lt;/section&gt;`) 提取出来，并用一个临时的、唯一的占位符（如 `&lt;!--CODEBLOCK_PLACEHOLDER_0--&gt;`）替换它们。
3.  然后，让 `juice` 去处理这个不包含复杂代码块的、“安全的” HTML。
4.  `juice` 完成处理后，我们再将之前提取出来的、未被破坏的原始代码块替换回占位符所在的位置。

通过这个方法，我们既利用了 `juice` 完成了对文章大部分内容的样式内联，又保护了代码块脆弱的 HTML 结构不被破坏，从而彻底解决了这个问题。
