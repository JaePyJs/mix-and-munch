import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={clsx('prose prose-invert max-w-none text-sm', className)}
      components={{
        p: ({ node, ...props }) => <p className="text-brand-gray-300 mb-2 leading-relaxed" {...props} />,
        em: ({ node, ...props }) => <em className="text-brand-gray-200 italic" {...props} />,
        strong: ({ node, ...props }) => <strong className="text-brand-gray-100 font-semibold" {...props} />,
        h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-brand-lime mb-3 mt-4" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-brand-lime mb-2 mt-3" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-base font-bold text-brand-gray-200 mb-2 mt-3" {...props} />,
        h4: ({ node, ...props }) => <h4 className="text-sm font-semibold text-brand-gray-300 mb-2 mt-2" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 text-brand-gray-300 mb-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 text-brand-gray-300 mb-2" {...props} />,
        li: ({ node, ...props }) => <li className="text-brand-gray-300" {...props} />,
        code: ({ node, inline, ...props }) => inline ? (
          <code className="bg-brand-gray-900/60 text-brand-lime px-1.5 py-0.5 rounded text-xs" {...props} />
        ) : (
          <code className="bg-brand-gray-900/60 text-brand-lime px-2 py-1 rounded block text-xs overflow-x-auto mb-2" {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-2 border-brand-lime/50 pl-3 py-1 text-brand-gray-400 italic mb-2" {...props} />
        ),
        hr: () => <hr className="border-brand-gray-800/50 my-3" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
