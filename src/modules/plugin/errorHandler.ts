import { Elysia } from 'elysia'
import { AppError, type ErrorBody } from '../lib/error'

// Semua error dibalas dengan format seragam: { error: { code, message, fields? } }
export const errorHandler = new Elysia({ name: 'error-handler' }).onError(
  { as: 'global' },
  ({ code, error, set }): ErrorBody => {
    if (error instanceof AppError) {
      set.status = error.status
      return { error: { code: error.code, message: error.message } }
    }

    if (code === 'VALIDATION') {
      set.status = 400
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input tidak valid',
          fields: error.all.map((e) => ({ path: e.path, message: e.message })),
        },
      }
    }

    if (code === 'NOT_FOUND') {
      set.status = 404
      return { error: { code: 'NOT_FOUND', message: 'Rute tidak ditemukan' } }
    }

    console.error(error)
    set.status = 500
    return { error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan pada server' } }
  },
)
