import {object, string, TypeOf} from "zod"

export const createUserSchema = object({
    body: object({
        name: string({
            required_error: 'Name is required'
        }),
        email: string({
            required_error: 'Email is a required field'
        }).email('Please enter a valid email'),
        password: string({
            required_error: 'Password is required'
        }).min(6, 'Password must be atleast 6 characters long'),
        passwordConfirmation: string({
            required_error: 'Password confirmation is required'
        })
    }).refine((data) => data.password === data.passwordConfirmation, {
        message: 'Password must be the same as Password confirmation',
        path: ['passwordConfirmation']
    })
})

export type CreateUserInput = Omit< TypeOf<typeof createUserSchema>, "body.passwordConfirmation">

