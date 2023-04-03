import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../service/todosService'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../lambda/utils'
import { createLogger } from '../utils/logger'
import * as createError from 'http-errors'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todosAccess = new TodosAccess()
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
    attachmentUrl: '',
    createdAt,
    done: false,
    ...parsedBody
  }

  return await todosAccess.createTodoItem(newTodo)
}

export async function getTodosForUser(
  event: APIGatewayProxyEvent
): Promise<TodoItem[]> {
  logger.info('Get list Todo by User ID')
  const userId = getUserId(event)
  const listTodos = todosAccess.getListTodos(userId)

  return listTodos
}

export async function deleteTodo(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  logger.info('Deleting todo item', {
    todoId,
    userId
  })
  const isExistsTodo = await todosAccess.checkTodoIdExists(todoId, userId)

  if (!isExistsTodo) {
    throw new createError.NotFound(`Todo item not found with id ${todoId}`)
  }

  await todosAccess.deleteTodoItem(todoId, userId)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      status: 'Deleted successfully'
    })
  }
}

export async function updateTodo(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId

  logger.info('Update todo item', {
    todoId,
    userId
  })

  const isExistsTodo = await todosAccess.checkTodoIdExists(todoId, userId)

  if (!isExistsTodo) {
    throw new createError.NotFound(`Todo item not found with id ${todoId}`)
  }
  const todo: UpdateTodoRequest = JSON.parse(event.body)

  await todosAccess.updateTodo(todoId, userId, todo)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(todo)
  }
}
