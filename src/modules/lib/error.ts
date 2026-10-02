export class AppError extends Error {
  constructor(
    public status: 400 | 401 | 403 | 404 | 409 | 429 | 500,
    public code: string,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export type ErrorBody = {
  error: {
    code: string
    message: string
    fields?: { path: string; message: string }[]
  }
}
