//Purpose createProduct, findProduct, findandUpdateProduct, deleteProduct

import { FilterQuery, UpdateQuery } from "mongoose";
import ProductModel, { ProductDocument, ProductInput } from "../model/product.model";

export const createProduct = async (input: ProductInput) => {
    try{
    const product = await ProductModel.create(input);
    return product
    }catch(e:any){
        throw new Error(e);
    }
}

export const findProduct = (query: FilterQuery<ProductDocument>) => {
    try{
        return ProductModel.findOne(query).lean();
    }catch(e:any){
        throw new Error(e);
    }
}

export const findProductAndUpdate = async(query: FilterQuery<ProductDocument>, update: UpdateQuery<ProductDocument>) => {
    try{
        return ProductModel.findOneAndUpdate(query, update, {new: true});
    }catch(e:any){
        throw new Error(e)
    }
}

export const deleteProduct = async(query: FilterQuery<ProductDocument>) => {
    try{
        return ProductModel.deleteOne(query);
    }catch(e:any){
        throw new Error(e)
    }
}