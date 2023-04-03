import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
const XAWS = AWSXRay.captureAWSClient(new AWS.DynamoDB())
const logger = createLogger('todoAccess')
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(
      {
        service: XAWS
      }
    ),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET
  ) {}

  async createTodoItem(todo: TodoItem): Promise<TodoItem> {
    logger.info(`Creating a Todo item with id ${todo.todoId}`)

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()

    return todo
  }

  async getListTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting all Todo items for user ${userId}`)

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

    const items = result.Items

    return items as TodoItem[]
  }

  async updateAttachmentUrl(todoId: string, attachmentId: string, userId) {
    logger.info(`Updating attachmentUrl ${todoId}`)

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        UpdateExpression: 'SET #attachmentUrl = :attachmentUrl',
        ExpressionAttributeNames: { '#attachmentUrl': 'attachmentUrl' },
        ExpressionAttributeValues: {
          ':attachmentUrl': `https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`
        }
      })
      .promise()
  }

  async checkTodoIdExists(todoId: string, userId): Promise<boolean> {
    logger.info(`Verify todo ${todoId}`)

    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        }
      })
      .promise()

    return !!result.Item
  }

  async deleteTodoItem(todoId: string, userId: string): Promise<void> {
    logger.info(`Deleting a Todo item with id ${todoId}`)

    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        }
      })
      .promise()
  }

  async updateTodo(
    userId: string,
    todoId: string,
    updateData: UpdateTodoRequest
  ): Promise<void> {
    logger.info(`Updating a Todo item with id ${todoId}`)

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { userId, todoId },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: { '#name': 'name' },
        ExpressionAttributeValues: {
          ':name': updateData.name,
          ':dueDate': updateData.dueDate,
          ':done': updateData.done
        },
        ReturnValues: 'ALL_NEW'
      })
      .promise()
  }
}
