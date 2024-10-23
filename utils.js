import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import customHeadingId from "marked-custom-heading-id";
marked.use(customHeadingId());
marked.use(markedKatex({throwOnError: false,displayMode: true}));


function augmentedRawMarkdown(rawMarkdown) {
    if (rawMarkdown !== undefined) {
        return rawMarkdown.replace(/(^#+.*\{#.*?\})/gm, (match) => match.replace('{#', '{#X'))
    }
} 


function translate(data) {
    marked.setOptions({
      // renderer: renderer,
      highlight: function (code, lang) {
        const hljs = highlight.HighlightJS;
        const language = lang;
        return hljs.highlight(code, { language }).value;
      },
      langPrefix: "hljs language-",
    });
    return marked(data);
  }

  
function markdownToHtml(rawMarkdown) {  
    let html_content = translate(rawMarkdown)
    return html_content
  }
  


export {
    markdownToHtml,
    augmentedRawMarkdown
}