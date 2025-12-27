import { getTotalQuestions, questionQueryOptions } from '@/utils/quiz.api';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import z from 'zod';

const ROUNDS_STORAGE_KEY = 'quiz-rounds-completed';
const ANSWERED_STORAGE_KEY = 'quiz-answered-questions';
const TOTAL_QUESTIONS = getTotalQuestions();

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
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);

  useEffect(() => {
    const storedRounds = localStorage.getItem(ROUNDS_STORAGE_KEY);
    if (storedRounds) {
      setRoundsCompleted(Number(storedRounds));
    }
    const storedAnswered = localStorage.getItem(ANSWERED_STORAGE_KEY);
    if (storedAnswered) {
      setAnsweredQuestions(JSON.parse(storedAnswered));
    }
  }, []);

  const updateRounds = (newRounds: number) => {
    setRoundsCompleted(newRounds);
    localStorage.setItem(ROUNDS_STORAGE_KEY, String(newRounds));
  };

  const markQuestionAnswered = (questionId: number) => {
    if (!answeredQuestions.includes(questionId)) {
      const updated = [...answeredQuestions, questionId];
      setAnsweredQuestions(updated);
      localStorage.setItem(ANSWERED_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const clearAnsweredHistory = () => {
    setAnsweredQuestions([]);
    localStorage.removeItem(ANSWERED_STORAGE_KEY);
  };

  const fullReset = () => {
    updateRounds(0);
    clearAnsweredHistory();
    setShowGameOver(false);
  };

  const handleCorrectAnswer = () => {
    markQuestionAnswered(Number(q));
    updateRounds(roundsCompleted + 1);
    setShowGameOver(false);
    goToNextQuestion();
  };

  const handleWrongAnswer = () => {
    markQuestionAnswered(Number(q));
    setShowGameOver(true);
  };

  const resetGame = () => {
    updateRounds(0);
    setShowGameOver(false);
  };

  const toggleAnswer = () => {
    navigate({
      search: (prev) => ({ ...prev, showAnswer: !showAnswer })
    })
  }

  const goToNextQuestion = () => {
    const currentId = Number(q);
    const nextId = currentId >= TOTAL_QUESTIONS ? 1 : currentId + 1;
    navigate({
      to: '/quiz/$q',
      params: { q: String(nextId) },
      search: { showAnswer: false }
    })
  }

  const goToRandomQuestion = () => {
    const randomId = Math.floor(Math.random() * TOTAL_QUESTIONS) + 1;
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
    
    if (questionNumber < 1 || questionNumber > TOTAL_QUESTIONS) {
      setInputError(`Question number must be between 1 and ${TOTAL_QUESTIONS}`);
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
          Question {question.id} of {TOTAL_QUESTIONS}
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

        <div className="mt-4 flex gap-3 flex-wrap">
          <button
            onClick={handleCorrectAnswer}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            ✓ Correct
          </button>
          <button
            onClick={handleWrongAnswer}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            ✗ Wrong
          </button>
        </div>

        <div className="mt-4 p-4 bg-slate-700 rounded text-white text-center">
          <span className="text-lg font-bold">Rounds Completed: {roundsCompleted}</span>
          <span className="mx-4">|</span>
          <span className="text-sm">Questions Answered: {answeredQuestions.length}/{TOTAL_QUESTIONS}</span>
          {answeredQuestions.includes(Number(q)) && (
            <span className="ml-2 text-yellow-400 text-sm">(Already answered)</span>
          )}
        </div>

        <div className="mt-2 text-center">
          <button
            onClick={fullReset}
            className="text-sm text-slate-400 hover:text-white underline"
          >
            Full Reset (Clear all history)
          </button>
        </div>

        {showGameOver && (
          <div className="mt-4 p-4 bg-red-800 rounded text-white text-center">
            <p className="text-lg font-bold mb-3">Game Over! You completed {roundsCompleted} rounds.</p>
            <button
              onClick={resetGame}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded"
            >
              Reset & Start Over
            </button>
          </div>
        )}

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
              max={TOTAL_QUESTIONS}
              value={goToInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Enter 1-${TOTAL_QUESTIONS}`}
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
