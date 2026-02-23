import { UNPROCESSABLE_CONTENT } from '@/constants'

const MESSAGE = 'JSON not parsable' as const

export class RequestJSONError {
  public details: {
    error: unknown
    message: typeof MESSAGE
  }

  public status = UNPROCESSABLE_CONTENT

  constructor(error: unknown) {
    this.details = { error, message: MESSAGE }
  }
}
