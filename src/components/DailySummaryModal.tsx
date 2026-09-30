import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Sun,
  Moon,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Task, TeamMember } from '../types/task';
import { fetchDailySummary } from '../services/api';

interface DailySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  team: TeamMember[];
}

export const DailySummaryModal: React.FC<DailySummaryModalProps> = ({
  isOpen,
  onClose,
  tasks,
  team,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'morning' | 'evening'>('morning');
  const [summary, setSummary] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const loadSummary = async (selectedMode: 'morning' | 'evening') => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await fetchDailySummary(tasks, team, selectedMode, today);
      setSummary(data.summary);
      setSource(data.source);
    } catch (err) {
      console.error(err);
      setSummary('Failed to generate summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSummary(mode);
    }
  }, [isOpen, mode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([summary], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TaskFlow-Sprint-Summary-${mode}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl border border-neutral-200 bg-white p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-neutral-800" />
            <h3 className="text-sm font-semibold text-neutral-900">
              Automated Daily Sprint Summary
            </h3>
            {source === 'gemini' && (
              <span className="text-2xs font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Gemini 3.8 Flash
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode Selector & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {/* Segmented control for Morning vs Evening */}
          <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-100 p-0.5 text-xs">
            <button
              onClick={() => setMode('morning')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                mode === 'morning'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              <span>Morning Kickoff</span>
            </button>
            <button
              onClick={() => setMode('evening')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                mode === 'evening'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Moon className="h-3.5 w-3.5 text-indigo-500" />
              <span>Evening Wrap-up</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadSummary(mode)}
              disabled={loading}
              className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
              title="Regenerate summary"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleCopy}
              disabled={loading || !summary}
              className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={loading || !summary}
              className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
              title="Download as markdown file"
            >
              <Download className="h-3 w-3" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="relative min-h-[280px] max-h-[55vh] overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-50/70 p-5 font-sans text-xs text-neutral-800 leading-relaxed">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-50/90">
              <RefreshCw className="h-5 w-5 animate-spin text-neutral-500" />
              <p className="text-xs text-neutral-500">
                Synthesizing sprint metrics & generating executive briefing...
              </p>
            </div>
          ) : (
            <div className="space-y-3 prose prose-xs max-w-none text-neutral-800">
              {summary.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h4 key={idx} className="font-semibold text-neutral-900 text-sm mt-3 mb-1 border-b border-neutral-200 pb-1">
                      {paragraph.replace('### ', '')}
                    </h4>
                  );
                }
                if (paragraph.startsWith('* ')) {
                  return (
                    <ul key={idx} className="list-disc pl-4 space-y-1">
                      {paragraph.split('\n').map((line, lineIdx) => (
                        <li key={lineIdx} className="text-neutral-700">
                          {line.replace(/^\*\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1')}
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={idx} className="text-neutral-700 leading-relaxed whitespace-pre-line">
                    {paragraph.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-between text-2xs text-neutral-400">
          <span>
            {mode === 'morning'
              ? 'Focusing on active tasks, upcoming deadlines, and team blockers.'
              : 'Focusing on completed items and setting up priorities for tomorrow.'}
          </span>
          <button
            onClick={onClose}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
