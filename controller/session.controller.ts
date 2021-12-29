//Purpose createUserSessionHandler getSessionsHandler deleteSessionHandler 

import { Request, Response } from "express";
import { createSession, findSessions, updateSessions } from "../service/session.service";
import { validatePassword } from "../service/user.service";
import { signJwt } from "../utils/jwt.utils";
import config from "config"
import log from "../utils/logger";

export const createUserSessionHandler = async (req: Request, res: Response) => {
    //verify password
    const user = await validatePassword(req.body);
    if(!user){
        res.status(403).send('Please check your email or password')
    }
    //create session
    let session;
    if(user){
    let session = await createSession(String(user._id), req.get("user-agent") || "")
    if(session){
        //create accessToken
        const accessToken = signJwt({...user, session: session._id}, {expiresIn: config.get<string>("accessTokenTtl")})
        //create refreshToken
        const refreshToken = signJwt({...user, session: session._id}, {expiresIn: config.get<string>("refreshTokenTtl")})
        // log.info(`Access and refresh tokens have been created successfully and they are: ${accessToken} and ${refreshToken}`)
        //send them both back
        return res.send({accessToken, refreshToken});
        }
    }
    
}

export const getSessionsHandler = async (req: Request, res: Response) => {
    log.info('getSessionHandler ran')
    const userId = res.locals.user._id
    const sessions = await findSessions({user:userId, valid:true})
    return res.send(sessions)
}

export const deleteSessionsHandler = (req: Request, res: Response) => {
    const sessionId = res.locals.user.session
    const session = updateSessions({_id: sessionId}, {valid:false})
    return res.send({
        accessToken: null,
        refreshToken: null
    })

}