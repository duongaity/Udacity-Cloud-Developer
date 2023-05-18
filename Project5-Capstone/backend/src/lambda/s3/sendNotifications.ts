import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { SNSHandler, SNSEvent, S3Event } from 'aws-lambda'

import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodoHandler')

const docClient = new AWS.DynamoDB.DocumentClient()

const connectionsTable = process.env.CONNECTIONS_TABLE
const stage = process.env.STAGE
const apiId = process.env.API_ID

const connectionParams = {
    apiVersion: "2018-11-29",
    endpoint: `${apiId}.execute-api.us-east-1.amazonaws.com/${stage}`
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams)

export const handler: SNSHandler = async (event: SNSEvent) => {
    logger.info('Processing SNS event ', JSON.stringify(event))

    for (const snsRecord of event.Records) {
        const s3EventStr = snsRecord.Sns.Message
        logger.info('Processing S3 event', s3EventStr)
        const s3Event = JSON.parse(s3EventStr)

        await processS3Event(s3Event)
    }
}

async function processS3Event(s3Event: S3Event) {
    for (const record of s3Event.Records) {
        const key = record.s3.object.key

        logger.info('Processing S3 item with key: ', key)

        const connections = await docClient.scan({
            TableName: connectionsTable
        }).promise()

        const payload = {
            imageId: key
        }

        for (const connection of connections.Items) {
            const connectionId = connection.id
            await sendMessageToClient(connectionId, payload)
        }
    }
}

async function sendMessageToClient(connectionId, payload) {
    try {
        logger.info('Sending message to a connection', connectionId)

        await apiGateway.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(payload),
        }).promise()
    } catch (e) {
        logger.info('Failed to send message', JSON.stringify(e))

        if (e.statusCode === 410) {
            logger.info('Stale connection')

            await docClient.delete({
                TableName: connectionsTable,
                Key: {
                    id: connectionId
                }
            }).promise()
        }
    }
}
