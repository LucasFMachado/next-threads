import * as z from 'zod'

export const ThreadValidation = z.object({
  accountId: z.string().min(1),
  thread: z
    .string()
    .min(1, 'Minimum 1 character.')
    .max(500, 'Maximum 500 characters.'),
})

export const CommentValidation = z.object({
  thread: z
    .string()
    .min(1, 'Minimum 1 character.')
    .max(500, 'Maximum 500 characters.'),
})
