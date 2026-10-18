import { rateLimit } from 'elysia-rate-limit'

export const loginLimit = rateLimit({
  duration: 60_000,
  max: 5,
  scoping: 'scoped',
  errorResponse: new Response(
    JSON.stringify({
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests"
      }
    }),
    {
      status: 429,
      headers: { "Content-type": "application/json" }
    }
  )
})

export const registerLimit = rateLimit({
  duration: 60_000,
  max: 8,
  scoping: 'scoped',
  errorResponse: new Response(
    JSON.stringify({
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests"
      }
    }),
    {
      status: 429,
      headers: { "Content-type": "application/json" },

    }
  )
})