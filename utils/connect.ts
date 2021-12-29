import config from "config"
import mongoose from "mongoose"
import log from './logger'

const url = config.get<string>("mongo_uri");

const connectDb = async () =>{
    try{
        await mongoose.connect(url);
        log.info('Database has been connected')
    }catch(e: any){
        log.error(`Database couldn't be connected due to ${e}`)
    }

}

export default connectDb;