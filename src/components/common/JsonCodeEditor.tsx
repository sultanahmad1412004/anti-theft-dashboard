import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Copy, Check, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface JsonCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  theme?: 'dark' | 'light' | 'vs-dark';
  readOnly?: boolean;
  className?: string;
}

export const JsonCodeEditor: React.FC<JsonCodeEditorProps> = ({
  value,
  onChange,
  height = '350px',
  theme = 'dark',
  readOnly = false,
  className = ''
}) => {
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Validate JSON on value change
  useEffect(() => {
    if (!value.trim()) {
      setError(null);
      return;
    }
    try {
      JSON.parse(value);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Invalid JSON syntax');
    }
  }, [value]);

  // Sync scrolling between textarea and line numbers
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Support Tab key indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Format JSON
  const handleFormat = () => {
    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange(formatted);
      toast.success('Formatted JSON');
    } catch (err: any) {
      toast.error('Cannot format: Syntax error in JSON');
    }
  };

  // Copy JSON
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = value.split('\n');
  const isDark = theme === 'dark' || theme === 'vs-dark';

  return (
    <div 
      className={`flex flex-col rounded-xl overflow-hidden border font-mono text-xs ${
        isDark 
          ? 'bg-[#0F1420] border-[#1F293D] text-[#E2E8F0]' 
          : 'bg-white border-slate-300 text-slate-900'
      } ${className}`}
      style={{ height }}
    >
      {/* Mini Toolbar */}
      <div className={`flex items-center justify-between px-3 py-1.5 border-b select-none shrink-0 ${
        isDark ? 'bg-[#0A0E1A] border-[#1F293D]' : 'bg-slate-100 border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-[10px] uppercase tracking-wider text-cyan-600 dark:text-[#00E5FF]">
            JSON Document Editor
          </span>
          {error ? (
            <span className="flex items-center gap-1 text-[10px] text-rose-500 font-bold">
              <AlertCircle className="w-3 h-3" /> Syntax Error
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Valid JSON
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleFormat}
            className={`p-1 px-2 rounded-md text-[10px] flex items-center gap-1 border transition-colors cursor-pointer ${
              isDark 
                ? 'border-slate-800 hover:bg-slate-800 text-slate-300' 
                : 'border-slate-300 hover:bg-slate-200 text-slate-700'
            }`}
            title="Prettify & Format JSON (2 spaces)"
          >
            <Wand2 className="w-3 h-3 text-cyan-500" />
            <span>Format</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`p-1 px-2 rounded-md text-[10px] flex items-center gap-1 border transition-colors cursor-pointer ${
              isDark 
                ? 'border-slate-800 hover:bg-slate-800 text-slate-300' 
                : 'border-slate-300 hover:bg-slate-200 text-slate-700'
            }`}
            title="Copy Raw Content"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body: Line Numbers + Textarea */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Line Numbers Column */}
        <div 
          ref={lineNumbersRef}
          aria-hidden="true"
          className={`w-11 py-2.5 pr-2 pl-1 select-none text-right font-mono text-[11px] leading-[20px] overflow-hidden shrink-0 border-r ${
            isDark 
              ? 'bg-[#090D16] border-[#1F293D] text-slate-600' 
              : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className={`flex-1 p-2.5 font-mono text-[11px] leading-[20px] resize-none outline-none overflow-auto whitespace-pre ${
            isDark 
              ? 'bg-[#0F1420] text-slate-100 placeholder-slate-600 selection:bg-cyan-500/30' 
              : 'bg-white text-slate-900 placeholder-slate-400 selection:bg-cyan-500/20'
          }`}
          placeholder="{\n  // Enter JSON data here...\n}"
        />
      </div>

      {/* Error Footer banner if invalid */}
      {error && (
        <div className="px-3 py-1 bg-rose-500/10 border-t border-rose-500/30 text-[10px] text-rose-500 font-mono truncate">
          Error: {error}
        </div>
      )}
    </div>
  );
};
