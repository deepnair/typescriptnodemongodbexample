//Purpose create UserDocument create Schema create model and export default it

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "config";

export interface UserInput{
    name: string,
    email: string,
    password: string,
}

export interface UserDocument extends UserInput, mongoose.Document {
    createdAt: Date,
    updatedAt: Date,
    comparePassword: (candidatePassword: string) => Promise<Boolean>
}

const userSchema = new mongoose.Schema({
    name: {type: String, required:true, unique: true},
    email: {type:String, required: true},
    password: {type: String, required: true},
    },
    {
        timestamps:true
    }
);

userSchema.pre("save", async function(next){
    let user = this as UserDocument;

    if(!user.isModified("password")){
        return next();
    }

    const salt = await bcrypt.genSalt(config.get<number>("saltWorkFactor"));
    const hashed = await bcrypt.hashSync(user.password, salt);

    user.password = hashed;

    return next();
})

userSchema.methods.comparePassword = function(candidatePassword: string){
    const user = this as UserDocument;

    return bcrypt.compare(candidatePassword, user.password).catch((e:any) => false);

}

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;

