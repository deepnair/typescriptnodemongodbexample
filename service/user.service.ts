// Purpose createUser validatePassword findUser
import {FilterQuery} from "mongoose"
import UserModel, {UserInput, UserDocument} from "../model/user.model"
import {omit} from "lodash"
import log from "../utils/logger"

export interface userType{
    email:     string;
    _id:       string;
    createdAt: Date;
    updatedAt: Date;
    __v:       number;
    toJSON?: () => any
}

export const createUser = async (input:UserInput) => {
    try{
        const user = await UserModel.create(input);
        log.info(user)
        return omit(user.toJSON(), "password");
    }catch(e:any){
        log.error(`Error happened at service`);
        throw new Error(e);
    }
}

export const validatePassword = async ({email, password}:{email:string, password:string}) => {
    const user = await UserModel.findOne({email});

    if(!user){
        return false
    }

    const isValid = await user.comparePassword(password);

    if(!isValid){
        return false;
    }

    return omit(user.toJSON(), "password");
}

export const findUser = async (query: FilterQuery<UserDocument>) => {
    return UserModel.findOne(query).lean();
}