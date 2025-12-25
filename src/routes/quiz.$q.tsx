import { questionQueryOptions } from '@/utils/quiz.api';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import z from 'zod';

const questionSearchParams = z.object({
  showAnswer: z.boolean().optional()
})

export const Route = createFileRoute('/quiz/$q')({
  component: RouteComponent,
  validateSearch: zodValidator(questionSearchParams),
  loaderDeps: ({ search: { showAnswer } }) => ({
    showAnswer,
  }),
  loader: async ({ context, params, deps }) => {
    return await context.queryClient.ensureQueryData(
      questionQueryOptions({
        id: Number(params.q), 
        showAnswer: deps.showAnswer 
      })
    )
  }
})

function RouteComponent() {
  const question = Route.useLoaderData();
  const { showAnswer } = Route.useSearch();
  const { q } = Route.useParams();
  const navigate = useNavigate({ from: Route.fullPath });
  const [goToInput, setGoToInput] = useState('');
  const [inputError, setInputError] = useState('');

  const toggleAnswer = () => {
    navigate({
      search: (prev) => ({ ...prev, showAnswer: !showAnswer })
    })
  }

  const goToNextQuestion = () => {
    const currentId = Number(q);
    const nextId = currentId >= 150 ? 1 : currentId + 1;
    navigate({
      to: '/quiz/$q',
      params: { q: String(nextId) },
      search: { showAnswer: false }
    })
  }

  const goToRandomQuestion = () => {
    const randomId = Math.floor(Math.random() * 150) + 1;
    navigate({
      to: '/quiz/$q',
      params: { q: String(randomId) },
      search: { showAnswer: false }
    })
  }

  const goToSpecificQuestion = () => {
    const questionNumber = Number(goToInput);
    
    if (!goToInput.trim()) {
      setInputError('Please enter a question number');
      return;
    }
    
    if (isNaN(questionNumber)) {
      setInputError('Please enter a valid number');
      return;
    }
    
    if (questionNumber < 1 || questionNumber > 150) {
      setInputError('Question number must be between 1 and 150');
      return;
    }
    
    setInputError('');
    setGoToInput('');
    navigate({
      to: '/quiz/$q',
      params: { q: String(questionNumber) },
      search: { showAnswer: false }
    })
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setGoToInput(e.target.value);
    setInputError('');
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      goToSpecificQuestion();
    }
  }

  if (!question) {
    return <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto text-white">Question not found</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto bg-slate-800 rounded-lg p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4">
          Question {question.id} of 150
        </h2>
        <p className="text-lg text-white mb-6">{question.question}</p>
        
        {question.options && (
          <div className="space-y-2 mb-6">
            {Object.entries(question.options).map(([key, value]) => (
              <div key={key} className="bg-slate-700 p-3 rounded text-white">
                <span className="font-bold">{key.toUpperCase()}:</span> {value}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={toggleAnswer}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </button>

          <button
            onClick={goToNextQuestion}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
          >
            Next Question →
          </button>

          <button
            onClick={goToRandomQuestion}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
          >
            Random Question 🎲
          </button>
        </div>

        {showAnswer && 'answer' in question && (
          <div className="mt-4 p-4 bg-green-700 rounded text-white">
            <strong>Answer:</strong> {question.answer.toUpperCase()}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-700">
          <label className="block text-white text-sm font-bold mb-2">
            Go to Question:
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="150"
              value={goToInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter 1-150"
              className="flex-1 bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={goToSpecificQuestion}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded"
            >
              Go
            </button>
          </div>
          {inputError && (
            <p className="mt-2 text-red-400 text-sm">{inputError}</p>
          )}
        </div>
      </div>
    </div>
  )
}
