import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

interface SignupFormProps {
  onToggle: () => void;
}

export function SignupForm({ onToggle }: SignupFormProps) {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-24 max-w-sm">
      <h2 className="mb-8 font-display text-2xl text-fg">Create an account</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="rounded-lg border border-line bg-surface px-4 py-2 text-fg placeholder-muted focus:border-accent focus:outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min. 8 characters)"
          required
          minLength={8}
          className="rounded-lg border border-line bg-surface px-4 py-2 text-fg placeholder-muted focus:border-accent focus:outline-none"
        />

        {error && (
          <div data-testid="error-banner" className="text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-accent px-5 py-2 font-medium text-fg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Signing up…" : "Sign up"}
        </button>
      </form>

      <p className="mt-8 border-t border-line pt-6 text-sm text-muted">
        Already have an account?{" "}
        <button onClick={onToggle} className="text-fg underline decoration-line underline-offset-4 hover:decoration-fg">
          Log in
        </button>
      </p>
    </div>
  );
}
