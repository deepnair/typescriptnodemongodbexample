import express from "express"
import config from "config"
import connectDb from "./utils/connect"
import log from "./utils/logger"
import routes from "./routes"
import deserializeUser from "./middleware/deserializeUser"
// import deserilizeUser from "./middleware/deserializeUser"

const app = express();

app.use(express.json());

app.use(deserializeUser);

const port = config.get<number>("port")

const start = async () => {
    try{
        await connectDb();
        // log.info('Database has been connected')
        app.listen(port, () => {
            log.info(`App is listening on port ${port}`)
        })
    }catch(e:any){
        log.error(`Error ${e} occurred`);
    }   
}

start();
routes(app);
