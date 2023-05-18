import * as React from 'react'
import { Form, Button, Icon } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { History } from 'history'
import dateFormat from 'dateformat'

import { Todo } from '../types/Todo'

import { createTodo, patchTodo } from '../api/todos-api'

import { getUploadUrl, uploadFile } from '../api/todos-api'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTodoProps {
  match: {
    params: {
      todoId: string
    }
  }
  auth: Auth
  history: History
}

interface EditTodoState {
  todo: Todo
  newTodoName: string
  file: any
  uploadState: UploadState
}

export class EditTodo extends React.PureComponent<
  EditTodoProps,
  EditTodoState
> {
  state: EditTodoState = {
    todo: {
      todoId: '',
      createdAt: '',
      name: '',
      dueDate: '',
      done: false,
      attachmentUrl: '',
    },
    file: undefined,
    newTodoName: '',
    uploadState: UploadState.NoUpload
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTodoName = event.target.value
    this.setState({ newTodoName: newTodoName })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.newTodoName) {
        alert('Todo name should be not empty')
        return
      }

      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      let todoId = this.props.match.params.todoId;
      if (todoId === 'new-task') {
        const dueDate = this.calculateDueDate()
        const newTodo = await createTodo(this.props.auth.getIdToken(), {
          name: this.state.newTodoName,
          dueDate
        })
        todoId = newTodo.todoId;
      } else {
        await patchTodo(this.props.auth.getIdToken(), todoId, {
          name: this.state.newTodoName,
          dueDate: this.state.todo.dueDate,
          done: this.state.todo.done
        })
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), todoId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')

      this.props.history.push('/')
    } catch (e) {
      alert('Could not upload a file: ' + (e as Error).message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd HH:mm') as string
  }

  render() {
    return (
      <div>
        <h1>New Task</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Task</label>
            <input
              type="text"
              placeholder="To change the world..."
              onChange={this.handleNameChange}
            />
          </Form.Field>

          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
          color="green"
          icon
        >
          <Icon name="save" /> Submit
        </Button>
      </div>
    )
  }
}
