import { useEffect, useState } from 'react'

type HealthStatus = 'checking' | 'ok' | 'error'

function App() {
  const [status, setStatus] = useState<HealthStatus>('checking')

  useEffect(() => {
    fetch('http://localhost:3001/health')
      .then((res) => res.json())
      .then((data) => setStatus(data.status === 'ok' ? 'ok' : 'error'))
      .catch(() => setStatus('error'))
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-100">
      <div className="rounded-lg border border-slate-700 bg-slate-800 px-8 py-6 text-center">
        <h1 className="text-2xl font-semibold">Signal</h1>
        <p className="mt-2 text-slate-400">Server health check:</p>
        <p
          className={
            status === 'ok'
              ? 'mt-1 font-mono text-emerald-400'
              : status === 'error'
                ? 'mt-1 font-mono text-red-400'
                : 'mt-1 font-mono text-slate-400'
          }
        >
          {status}
        </p>
      </div>
    </div>
  )
}

export default App
