import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getTodosForUser } from '../../controller/todosController'
import { createLogger } from '../../utils/logger'
const logger = createLogger('getTodoHandler')

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoItems = await getTodosForUser(event)
      return {
        statusCode: 200,
        body: JSON.stringify({
          items: todoItems
        })
      }
    } catch (error) {
      logger.error(`Error to get list: ${error.message}`)

      // customize error code
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Can not get list !'
        })
      }
    }
  }
)
handler.use(
  cors({
    credentials: true
  })
)
