
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-slate max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};
