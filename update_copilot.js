const fs = require('fs');
const file = 'frontend/src/pages/Copilot.tsx';
let content = fs.readFileSync(file, 'utf8');

const search =             code: ({ node, inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              if (!inline && match && match[1] === 'mermaid') {
                return <MermaidRenderer chart={String(children).replace(/\\n$/, '')} />;
              };

const replace =             code: ({ node, inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              if (!inline && match) {
                if (match[1] === 'mermaid') {
                  return <MermaidRenderer chart={String(children).replace(/\\n$/, '')} />;
                }
                if (match[1] === '3dmodel') {
                  return <ModelViewer type={String(children).replace(/\\n$/, '')} />;
                }
              };

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Success! Replaced using exact string match.");
} else {
    console.log("Exact match failed, trying fallback regex...");
    content = content.replace(/if \(!inline && match && match\[1\] === 'mermaid'\) \{[\s\S]*?return <MermaidRenderer chart=\{String\(children\)\.replace\(\/\\n\$\/, ''\)\} \/>;\s*\}/g, if (!inline && match) { if (match[1] === 'mermaid') { return <MermaidRenderer chart={String(children).replace(/\\n$/, '')} />; } if (match[1] === '3dmodel') { return <ModelViewer type={String(children).replace(/\\n$/, '')} />; } });
    fs.writeFileSync(file, content, 'utf8');
    console.log("Regex replace executed.");
}