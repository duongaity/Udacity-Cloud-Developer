import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateTodoHandler')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId

      if (!event.body || !todoId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Error updateTodo!'
          })
        }
      }

      return await updateTodo(event)
    } catch (error) {
      logger.error('Error updateTodo!', error.message)

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Error updateTodo!'
        })
      }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
