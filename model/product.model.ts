//Purpose create productschema type and model

import mongoose from "mongoose";
import { UserDocument } from "./user.model";

export interface ProductInput{
    user: UserDocument["_id"],
    title: string,
    description: string,
    image: string,
    price: number,
}

export interface ProductDocument extends ProductInput, mongoose.Document{
    createdAt: Date,
    updatedAt: Date
}

const productSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
    title: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, requied: true},
    price: {type: Number, required: true}
},{
    timestamps: true
})


const ProductModel = mongoose.model<ProductDocument>("Product", productSchema)

export default ProductModel;
