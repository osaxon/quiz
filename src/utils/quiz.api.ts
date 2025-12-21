import { Quiz, type Question } from '@/schemas/quiz.schema'
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { z } from 'zod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const QUIZ_FILE = path.join(__dirname, '../data/quiz.json')

async function readQuizFile(): Promise<z.infer<typeof Question>[]> {
  const rawData = await fs.promises.readFile(QUIZ_FILE, 'utf-8')
  const json = JSON.parse(rawData)
  
  const parsed = Quiz.safeParse(json)
  
  if (!parsed.success) {
    console.error("Error parsing quiz data:", parsed.error)
    throw new Error("Failed to parse quiz data")
  }
  
  return parsed.data
}

export const getQuizQuestions = createServerFn({
  method: 'GET',
}).handler(async () => {
  return await readQuizFile()
})

export const getQuestionById = createServerFn({
  method: 'GET',
})
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    const questions = await readQuizFile()
    return questions.find(q => q.id === id)
  })

export const getRandomQuestions = createServerFn({
  method: 'GET',
})
  .inputValidator((count: number) => count)
  .handler(async ({ data: count }) => {
    const questions = await readQuizFile()
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  })

export const getRandomQuestion = createServerFn({
  method: 'GET',
}).handler(async () => {
  const questions = await readQuizFile()
  const randomIndex = Math.floor(Math.random() * questions.length)
  return questions[randomIndex]
})

export const getTotalQuestions = createServerFn({
  method: 'GET',
}).handler(async () => {
  const questions = await readQuizFile()
  return questions.length
})

export const quizQueryOptions = queryOptions({
  queryKey: ["quiz"],
  queryFn: () => getQuizQuestions(),
});

export const questionQueryOptions = (id: number) => queryOptions({
  queryKey: ["question", id],
  queryFn: () => getQuestionById({ data: id })
});