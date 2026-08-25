import { useState, type FormEvent } from "react";

interface AskFormProps {
  onSubmit: (question: string) => void;
  loading: boolean;
}

export function AskForm({ onSubmit, loading }: AskFormProps) {
  const [question, setQuestion] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!question.trim() || loading) return;
    onSubmit(question.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="e.g. What's the most in-demand skill this month?"
        className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !question.trim()}
        className="rounded-lg bg-sky-500 px-5 py-2 font-medium text-white transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        {loading ? "Asking…" : "Ask"}
      </button>
    </form>
  );
}
