import { Quiz, type Question } from '@/schemas/quiz.schema'
import quizData from '@/data/quiz.json'
import { queryOptions } from '@tanstack/react-query'
import type { z } from 'zod'

function getValidatedQuizData(): z.infer<typeof Question>[] {
  const parsed = Quiz.safeParse(quizData)
  
  if (!parsed.success) {
    console.error("Error parsing quiz data:", parsed.error)
    throw new Error("Failed to parse quiz data")
  }
  
  return parsed.data
}

export function getQuizQuestions() {
  return getValidatedQuizData()
}

export function getQuestionById(id: number) {
  const questions = getValidatedQuizData()
  return questions.find(q => q.id === id)
}

export function getRandomQuestions(count: number) {
  const questions = getValidatedQuizData()
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function getRandomQuestion() {
  const questions = getValidatedQuizData()
  const randomIndex = Math.floor(Math.random() * questions.length)
  return questions[randomIndex]
}

export function getTotalQuestions() {
  const questions = getValidatedQuizData()
  return questions.length
}

export const quizQueryOptions = queryOptions({
  queryKey: ["quiz"],
  queryFn: () => getQuizQuestions(),
})

export const questionQueryOptions = (id: number) => queryOptions({
  queryKey: ["question", id],
  queryFn: () => getQuestionById(id)
})
