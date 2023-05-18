import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodoHandler')

const docClient = new AWS.DynamoDB.DocumentClient()

const connectionsTable = process.env.CONNECTIONS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Websocket disconnect', event)

    const connectionId = event.requestContext.connectionId
    const key = {
        id: connectionId
    }

    logger.info('Removing item with key', key)

    await docClient.delete({
        TableName: connectionsTable,
        Key: key
    }).promise()

    return {
        statusCode: 200,
        body: ''
    }
}
