import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
// import { TodoUpdate } from '../models/TodoUpdate'
const XAWS = AWSXRay.captureAWSClient(new AWS.DynamoDB())
const logger = createLogger('todoAccess')
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(
      {
        service: XAWS
      }
    ),
    private readonly todosTable = process.env.TODOS_TABLE // private readonly indexName = process.env.TODOS_INDEX, // private readonly bucketName = process.env.ATTACHMENTS_S3_BUCKET, // private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
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

  //   async getTodos(userId: string): Promise<TodoItem[]> {
  //     logger.info(`Getting all Todo items for user ${userId}`)

  //     const result = await this.docClient
  //       .query({
  //         TableName: this.todosTable,
  //         IndexName: this.indexName,
  //         KeyConditionExpression: 'userId = :userId',
  //         ExpressionAttributeValues: {
  //           ':userId': userId
  //         },
  //         ScanIndexForward: false
  //       })
  //       .promise()

  //     const items = result.Items

  //     return items as TodoItem[]
  //   }

  //   async updateAttachmentUrl(todoId: string, userId: string): Promise<void> {
  //     logger.info(`Updating attachment URL for Todo item with id ${todoId}`)

  //     const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`

  //     await this.docClient
  //       .update({
  //         TableName: this.todosTable,
  //         Key: {
  //           todoId,
  //           userId
  //         },
  //         UpdateExpression: 'set attachmentUrl = :attachmentUrl',
  //         ExpressionAttributeValues: {
  //           ':attachmentUrl': attachmentUrl
  //         }
  //       })
  //       .promise()
  //   }
}
