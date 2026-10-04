import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, AlertCircle, Wrench, Copy, Check, ExternalLink, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';
  const isRefusal = message.isOffTopic;

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Pre-process message text: convert raw <br> or <br/> tags to newlines so Markdown parses them cleanly
  const cleanContent = (message.text || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .trim();

  return (
    <div className={`flex gap-3.5 my-5 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in group`}>
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
          isUser
            ? 'bg-[#141413] text-white'
            : isRefusal
            ? 'bg-amber-100 text-amber-700'
            : 'bg-primary text-white'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : isRefusal ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Bubble Content */}
      <div className={`max-w-[90%] sm:max-w-[82%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1.5 px-1 flex-wrap">
          <span className="text-xs font-bold text-text-secondary">
            {isUser ? 'You' : 'Career Copilot'}
          </span>

          {/* Active Tool Calling Animation */}
          {message.activeTool && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200 shadow-2xs animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              <Wrench className="w-3 h-3 text-amber-600 animate-spin" />
              Calling <code className="font-mono text-amber-800">{message.activeTool}</code>...
            </span>
          )}

          {/* Completed Tools Badges */}
          {message.tools && message.tools.length > 0 && !message.activeTool && (
            <div className="flex items-center gap-1 flex-wrap">
              {message.tools.map((t, i) => (
                <span 
                  key={i}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20"
                >
                  <CheckCircle2 className="w-2.5 h-2.5 text-success" />
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Message Card */}
        <div
          className={`relative p-5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-[#141413] text-white rounded-tr-none shadow-sm'
              : isRefusal
              ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-none shadow-sm'
              : 'bg-white border border-border text-dark rounded-tl-none shadow-sm'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{cleanContent}</div>
          ) : !cleanContent && message.isStreaming ? (
            /* Live placeholder when streaming has begun but no text chunk arrived yet */
            <div className="flex items-center gap-2.5 text-xs text-text-muted py-1">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span>
                {message.activeTool 
                  ? `Executing ${message.activeTool} to gather real-time data...` 
                  : "Thinking & formulating response..."}
              </span>
            </div>
          ) : (
            <div className="markdown-chat-body prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-lg font-extrabold text-dark mt-4 mb-2 first:mt-0 pb-1 border-b border-border" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-base font-bold text-dark mt-3.5 mb-2 first:mt-0" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-sm font-bold text-primary mt-3 mb-1.5 first:mt-0" {...props} />,
                  h4: ({ node, ...props }) => <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-2.5 mb-1" {...props} />,
                  
                  p: ({ node, ...props }) => <p className="mb-3 last:mb-0 leading-relaxed text-dark" {...props} />,
                  
                  ul: ({ node, ...props }) => <ul className="my-2.5 pl-5 list-disc space-y-1.5 text-dark" {...props} />,
                  ol: ({ node, ...props }) => <ol className="my-2.5 pl-5 list-decimal space-y-1.5 text-dark" {...props} />,
                  li: ({ node, ...props }) => <li className="leading-relaxed pl-0.5" {...props} />,
                  
                  strong: ({ node, ...props }) => <strong className="font-bold text-dark" {...props} />,
                  
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-primary/40 bg-surface-alt px-4 py-2.5 rounded-r-xl my-3 italic text-text-secondary" {...props} />
                  ),

                  table: ({ node, ...props }) => (
                    <div className="my-4 w-full overflow-x-auto rounded-xl border border-border shadow-sm">
                      <table className="w-full text-left text-xs border-collapse" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => (
                    <thead className="bg-surface-alt border-b border-border text-dark uppercase tracking-wider font-bold" {...props} />
                  ),
                  th: ({ node, ...props }) => (
                    <th className="px-4 py-3 font-extrabold text-dark border-r border-border last:border-r-0 whitespace-nowrap bg-surface-alt" {...props} />
                  ),
                  tbody: ({ node, ...props }) => (
                    <tbody className="divide-y divide-border bg-white" {...props} />
                  ),
                  tr: ({ node, ...props }) => (
                    <tr className="hover:bg-primary/5 transition-colors odd:bg-white even:bg-surface-alt/50" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="px-4 py-3 border-r border-border last:border-r-0 text-text-secondary align-top leading-normal" {...props} />
                  ),

                  code: ({ node, inline, ...props }) => {
                    if (inline) {
                      return <code className="px-1.5 py-0.5 rounded-md bg-surface-alt border border-border text-primary font-mono text-xs font-semibold" {...props} />;
                    }
                    return (
                      <div className="my-3 rounded-xl overflow-hidden bg-dark text-slate-100 border border-slate-800">
                        <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed" {...props} />
                      </div>
                    );
                  },

                  a: ({ node, href, children, ...props }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-primary font-semibold hover:underline"
                      {...props}
                    >
                      {children}
                      <ExternalLink className="w-3 h-3 inline-block ml-0.5" />
                    </a>
                  ),

                  hr: ({ node, ...props }) => <hr className="my-4 border-border" {...props} />,
                }}
              >
                {cleanContent}
              </ReactMarkdown>

              {/* Streaming Cursor */}
              {message.isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle rounded-xs"></span>
              )}
            </div>
          )}

          {/* Copy Message Button for Copilot */}
          {!isUser && cleanContent && !message.isStreaming && (
            <div className="mt-3 pt-2 border-t border-border/50 flex justify-end">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-semibold text-text-muted hover:text-primary transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-surface-alt"
                title="Copy message"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-success" />
                    <span className="text-success">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
