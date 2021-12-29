import {get} from "lodash"
import {Request, Response, NextFunction} from "express"
import {verifyJwt} from "../utils/jwt.utils"
import { reissueAccessToken } from "../service/session.service"
import log from "../utils/logger"

const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = get(req, "headers.authorization", "").replace(/Bearer\s/, "");
    
    const refreshToken = get(req, "headers.x-refresh", "");
    
    if(!accessToken){
        return next()
    }

    const result = verifyJwt(accessToken);
    const decoded = result.decoded
    const expired = result.expired
    log.info(result)
    if(decoded){
        res.locals.user = decoded;
        log.info(res.locals.user)
        return next()
    }

    if(expired && refreshToken){
        log.info(`Refresh token is ${refreshToken}`)
        const newAccessToken = await reissueAccessToken({refreshToken})
        log.info(`New access Token was generated and it is ${newAccessToken}`)
        if(newAccessToken){
            res.setHeader("x-access-token", newAccessToken);
            const {decoded} = verifyJwt(newAccessToken);
            res.locals.user = decoded;
            log.info(`new user is ${decoded}`)
        }        
        return next();
    }

    return next();


}

export default deserializeUser;
