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
    <form onSubmit={handleSubmit} className="flex items-end gap-4">
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="e.g. What's the most in-demand skill this month?"
        className="flex-1 border-0 border-b border-line bg-transparent px-1 py-2 text-fg placeholder-muted focus:border-accent focus:outline-none"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !question.trim()}
        className="rounded-lg bg-accent px-5 py-2 font-medium text-fg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Asking…" : "Ask"}
      </button>
    </form>
  );
}
