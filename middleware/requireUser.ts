import {Request, Response, NextFunction} from "express"
import log from "../utils/logger"

const requireUser = (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    log.info(`In require user, user is ${user}`);
    if(!user){
        log.info('!user ran')
        return res.sendStatus(403);
    }

    return next();
}

export default requireUser;