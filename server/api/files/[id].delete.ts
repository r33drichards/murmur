import { eq, and } from 'drizzle-orm'
import { useValidatedParams, z } from 'h3-zod'

export default eventHandler(async (event) => {
  const { id } = await useValidatedParams(event, {
    id: z.string().uuid()
  })
  const { user } = await requireUserSession(event)

  // List todos for the current user
  const deletedTodo = await useDB().delete(tables.files).where(and(
    eq(tables.files.id, id),
    eq(tables.files.userId, user.id)
  )).returning().get()

  if (!deletedTodo) {
    throw createError({
      statusCode: 404,
      message: 'File not found'
    })
  }
  return deletedTodo
})
