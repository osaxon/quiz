import { quizQueryOptions } from '@/utils/quiz.api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ 
  component: App, 
  loader: async ({ context }) => await context.queryClient.ensureQueryData(quizQueryOptions)
})

function App() {
  const quiz = Route.useLoaderData()

  return (
    <div className="min-h-screen">
      {quiz?.map(q => (
        <p key={q.id}>{q.question}</p>
      ))}
    </div>
  )
}
