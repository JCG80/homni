
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-slate max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-5 border-b pb-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-8 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc ml-6 mb-4" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal ml-6 mb-4" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4" {...props} />,
          code: ({ node, className, children, ...props }) => (
            <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono text-sm" {...props}>
              {children}
            </code>
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="border-collapse table-auto w-full" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left font-bold" {...props} />,
          td: ({ node, ...props }) => <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
