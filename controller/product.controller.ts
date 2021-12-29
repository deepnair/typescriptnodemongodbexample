//Purpose createProductHandler, getProductHandler, updateProductHandler, deleteProductHandler

import { Request, Response } from "express";
import { createProduct, deleteProduct, findProduct, findProductAndUpdate } from "../service/product.service";
import log from "../utils/logger"

export interface ParamsInput {
    productId: string
}

export type BodyInput = {
    title: string,
    description: string,
    price: number,
    image: string

}

export const createProductHandler = async (req: Request<{}, {}, BodyInput>, res: Response) => {
    try{
        const userId = res.locals.user._id
        const body = req.body
        const product = await createProduct({...body, user: userId})
        res.send(product)
    }catch(e:any){
        res.status(400).send(`There was an error: ${e}`)
    }

}

export const getProductHandler = async (req: Request<ParamsInput>, res: Response) => {
    try{
        const product = await findProduct({_id: req.params.productId})
        res.send(product)
    }catch(e:any){
        res.status(404).send('Product you were looking for doesn\'t exist')
    }

}

export const updateProductHandler = async (req: Request<ParamsInput, {}, BodyInput>, res: Response) => {
    try{
        
        const product = await findProduct({_id: req.params.productId})
        if(!product){
            res.status(404).send('Product you were trying to update doesn\'t exist')
        }
        log.info(`User is ${res.locals.user}`)
        const userId = String(res.locals.user._id)
        if(product){
            if(userId === String(product.user)){
            const updatedProduct = await findProductAndUpdate(product, req.body) 
            res.send(updatedProduct)
            }else{
                res.status(403).send('You cannot edit this product')
            }
        }
    }catch(e:any){
        log.info(e)
        res.status(400).send('Could not update the product')
    }
}

export const deleteProductHandler = async (req:Request<ParamsInput>, res: Response) => {
    try{
        
        const product = await findProduct({_id: req.params.productId})
        if(!product){
            res.status(404).send('Product you were trying to update doesn\'t exist')
        }
        const userId = String(res.locals.user._id)
        if(product){
            if(userId === String(product.user)){
            const updatedProduct = await deleteProduct(product) 
            res.send(updatedProduct)
            }else{
                res.status(403).send('You cannot delete this product')
            }
        }
    }catch(e:any){
        res.status(400).send('Could not delete the product')
    }
}