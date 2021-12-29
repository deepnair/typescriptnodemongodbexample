import {string, object} from "zod"

const createSessionSchema = object({
    body: object({
        email: string({
            required_error: 'Email is required'
        }).email('Must be a valid e-mail'),
        password: string({
            required_error: 'Password is required'
        })
    })
})

export default createSessionSchema;