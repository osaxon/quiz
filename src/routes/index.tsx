import { quizQueryOptions } from '@/utils/quiz.api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ 
  component: App, 
  loader: async ({ context }) => await context.queryClient.ensureQueryData(quizQueryOptions)
})

function App() {
  const quiz = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {quiz?.map(q => (
        <p key={q.id}>{q.question}</p>
      ))}
    </div>
  )
}
