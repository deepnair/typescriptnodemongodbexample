//Purpose payload params createProductSchema getProductSchema updateProuctSchema deleteProductSchema
import {object, string, number, TypeOf} from "zod"

const payload = {
    body: object({
        title: string({
            required_error: 'You need a title for the product'
        }),
        description: string({
            required_error: 'Description is required'
        }).min(100, 'Descrisption must be atleast 100 characters'),
        price: number({
            required_error: 'Price is required'
        }),
        image: string({
            required_error: 'Image for the product is required'
        })
    })
}

const params = {
    params: object({
        productId: string({
            required_error: 'Params is required for this'
        })
    })
}

export const createProductSchema = object({...payload})

export const getProductSchema = object({...params})

export const updateProductSchema = object({...payload, ...params})

export const deleteProductSchema = object({...params})





