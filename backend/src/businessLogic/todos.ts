import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../controller/todosAcess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { getUserId } from '../lambda/utils'
import { createLogger } from '../utils/logger'

// import { AttachmentUtils } from './attachmentUtils';
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import * as createError from 'http-errors'

const todosAccess = new TodosAccess()
// const attachmentUtils = new AttachmentUtils()
const logger = createLogger('todos')

export async function createTodo(
  event: APIGatewayProxyEvent
): Promise<TodoItem> {
  logger.info('Creating todo item')
  const userId = getUserId(event)
  const todoId = uuid.v4()
  const createdAt = new Date().toISOString()
  const parsedBody: CreateTodoRequest = JSON.parse(event.body)
  const newTodo: TodoItem = {
    todoId,
    userId,
    createdAt,
    done: false,
    ...parsedBody
  }

  return await todosAccess.createTodoItem(newTodo)
}

// export async function updateTodo(
//   todoId: string,
//   updateTodoRequest: UpdateTodoRequest,
//   userId: string
// ): Promise<void> {
//   logger.info('Updating todo item', {
//     todoId,
//     updateTodoRequest,
//     userId
//   })

//   const todoItem = await todosAccess.getTodoItem(todoId)

//   if (!todoItem) {
//     throw new createError.NotFound(`Todo item not found with id ${todoId}`)
//   }

//   if (todoItem.userId !== userId) {
//     throw new createError.Forbidden(
//       'Cannot update todo item that belongs to another user'
//     )
//   }

//   if (updateTodoRequest.hasOwnProperty('attachmentUrl')) {
//     const attachmentUrl = await attachmentUtils.getPresignedUrl(todoId)
//     todoItem.attachmentUrl = attachmentUrl
//   }

//   Object.assign(todoItem, updateTodoRequest)

//   await todosAccess.updateTodoItem(todoItem)
// }

// export async function deleteTodo(
//   todoId: string,
//   userId: string
// ): Promise<void> {
//   logger.info('Deleting todo item', {
//     todoId,
//     userId
//   })

//   const todoItem = await todosAccess.getTodoItem(todoId)

//   if (!todoItem) {
//     throw new createError.NotFound(`Todo item not found with id ${todoId}`)
//   }

//   if (todoItem.userId !== userId) {
//     throw new createError.Forbidden(
//       'Cannot delete todo item that belongs to another user'
//     )
//   }

//   await todosAccess.deleteTodoItem(todoId)
// }
