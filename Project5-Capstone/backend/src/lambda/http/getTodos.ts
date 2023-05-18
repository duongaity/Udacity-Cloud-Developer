import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getTodosForUser } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodoHandler')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoItems = await getTodosForUser(event)
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          items: todoItems
        })
      }
    } catch (error) {
      logger.error('Error getTodosForUser', error.message)

      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Error getTodosForUser!'
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
