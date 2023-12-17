import { Error } from "../types"

export const createError = (status: number, message: string) => {
    const error: Error = new Error()
    error.status = status
    error.message = message
    return error
}
