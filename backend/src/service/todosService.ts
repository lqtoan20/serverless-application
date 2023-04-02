import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
const XAWS = AWSXRay.captureAWSClient(new AWS.DynamoDB())
const logger = createLogger('todoAccess')
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(
      {
        service: XAWS
      }
    ),
    private readonly todosTable = process.env.TODOS_TABLE, // private readonly indexName = process.env.TODOS_INDEX
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

  //   async deleteTodoItem(todoId: string, userId: string): Promise<void> {
  //     // logger.info(`Deleting a Todo item with id ${todoId}`)

  //     await this.docClient
  //       .delete({
  //         TableName: this.todosTable,
  //         Key: {
  //           todoId,
  //           userId
  //         }
  //       })
  //       .promise()
  //   }

  //   async updateTodoItem(
  //     todoId: string,
  //     userId: string,
  //     updatedTodo: TodoUpdate
  //   ): Promise<TodoItem> {
  //     // logger.info(`Updating a Todo item with id ${todoId}`)

  //     await this.docClient
  //       .update({
  //         TableName: this.todosTable,
  //         Key: {
  //           todoId,
  //           userId
  //         },
  //         UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
  //         ExpressionAttributeNames: {
  //           '#name': 'name'
  //         },
  //         ExpressionAttributeValues: {
  //           ':name': updatedTodo.name,
  //           ':dueDate': updatedTodo.dueDate,
  //           ':done': updatedTodo.done
  //         },
  //         ReturnValues: 'ALL_NEW'
  //       })
  //       .promise()

  //     return {
  //       ...updatedTodo,
  //       todoId,
  //       userId
  //     }
  //   }
}
