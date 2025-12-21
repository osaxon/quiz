import * as z from "zod"; 

export const Options = z.object({
  a: z.string(),
  b: z.string(),
  c: z.string(),
  d: z.string(),
})

export const Question = z.object({
  id: z.number(),
  question: z.string(),
  options: Options,
  answer: z.string()
})

export const Quiz = z.array(Question)