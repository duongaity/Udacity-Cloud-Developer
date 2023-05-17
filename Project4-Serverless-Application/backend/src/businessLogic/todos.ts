import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../lambda/utils'
import * as createError from 'http-errors'
import { createLogger } from '../utils/logger'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()

const logger = createLogger('todos')

export async function createTodo(
    event: APIGatewayProxyEvent
): Promise<TodoItem> {
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

    logger.info('createTodo', newTodo)

    return await todoAccess.createTodoItem(newTodo)
}

export async function getTodosForUser(
    event: APIGatewayProxyEvent
): Promise<TodoItem[]> {
    const userId = getUserId(event)
    const listTodos = todoAccess.getListTodos(userId)

    logger.info('getTodosForUser', userId)

    return listTodos
}

export async function deleteTodo(
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    const isExistsTodo = await todoAccess.checkTodoIdExists(todoId, userId)

    if (!isExistsTodo) {
        throw new createError.NotFound(`Todo item not found with id ${todoId}`)
    }

    logger.info('deleteTodo', { userId, todoId })

    await todoAccess.deleteTodoItem(todoId, userId)

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

    const isExistsTodo = await todoAccess.checkTodoIdExists(todoId, userId)

    if (!isExistsTodo) {
        throw new createError.NotFound(`Todo item not found with id ${todoId}`)
    }
    const todo: UpdateTodoRequest = JSON.parse(event.body)

    await todoAccess.updateTodo(todoId, userId, todo)

    logger.info('updateTodo', { userId, todoId, todo })

    return {
        statusCode: 204,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(todo)
    }
}

export async function createAttachmentPresignedUrl(
    event: APIGatewayProxyEvent
): Promise<string> {
    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    const attachmentId = uuid.v4()

    if (!todoId) {
        throw new createError.NotFound(`Todo item not found with id ${todoId}`)
    }

    const uploadUrl = await todoAccess.updateAttachmentUrl(
        todoId,
        attachmentId,
        userId
    )

    logger.info('createAttachmentPresignedUrl', { userId, todoId, attachmentId })

    return uploadUrl
}
