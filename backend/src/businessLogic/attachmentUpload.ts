import { APIGatewayProxyEvent } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'
import * as createError from 'http-errors'
import { TodosAccess } from '../dataLayer/todosAccess'
import * as uuid from 'uuid'
import { getUserId } from '../lambda/utils'

const logger = createLogger('generateUploadUrl')
const XAWS = AWSXRay.captureAWS(AWS)
const bucketName = process.env.ATTACHMENT_S3_BUCKET

// To fix issue: The expiration must be a number, received string
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const todosAccess = new TodosAccess()

export async function createAttachmentPresignedUrl(
  event: APIGatewayProxyEvent
): Promise<string> {
  logger.info('Start upload file')
  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  const attachmentId = uuid.v4()
  if (!todoId) {
    throw new createError.NotFound(`Todo item not found with id ${todoId}`)
  }

  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: attachmentId,
    Expires: urlExpiration
  })

  await todosAccess.updateAttachmentUrl(todoId, attachmentId, userId)

  return uploadUrl
}
