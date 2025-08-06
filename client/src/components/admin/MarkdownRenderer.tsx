import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  // Fonction pour convertir le markdown en HTML
  const parseMarkdown = (text: string): string => {
    if (!text) return '';

    let html = text;

    // Titres
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-6">$1</h1>');

    // Gras et italique
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Code inline
    html = html.replace(/`(.*?)`/g, '<code class="bg-base-200 px-1 py-0.5 rounded text-sm font-mono">$1</code>');

    // Liens
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="link link-primary" target="_blank" rel="noopener noreferrer">$1</a>');

    // Citations
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 italic text-base-content/80 my-4">$1</blockquote>');

    // Listes
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4">• $1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>');

    // Blocs de code
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-base-200 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">$1</code></pre>');

    // Sauts de ligne
    html = html.replace(/\n\n/g, '</p><p class="mb-4">');
    html = html.replace(/\n/g, '<br>');

    // Envelopper dans des paragraphes
    if (html && !html.startsWith('<')) {
      html = '<p class="mb-4">' + html + '</p>';
    }

    return html;
  };

  const htmlContent = parseMarkdown(content);

  return (
    <div 
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownRenderer;
