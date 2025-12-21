import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ 
  component: App
})

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Meal Quiz
        </h1>
        <Link
          to="/quiz/$q"
          params={{ q: '1' }}
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl py-4 px-8 rounded-lg transition-colors"
        >
          Start Quiz
        </Link>
      </div>
    </div>
  )
}
