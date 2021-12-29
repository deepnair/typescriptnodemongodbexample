//Purpose createSession, getSessions, updateSession, reissueAccessToken
import { Request, Response } from "express";
import { FilterQuery, UpdateQuery } from "mongoose";
import SessionModel, { SessionDocument } from "../model/session.model"
import {get} from "lodash";
import { signJwt, verifyJwt } from "../utils/jwt.utils";
import log from "../utils/logger";
import { findUser } from "./user.service";
import config from "config";

export const createSession = async (userId:string, userAgent:string) => {
    try{
        const session = await SessionModel.create({user: userId, userAgent});
        return session.toJSON()
    }catch(e: any){
        log.error('Error occurred at session.service.ts')
        throw Error(e)
    }
}

export const findSessions = async (query: FilterQuery<SessionDocument>) => {
    return SessionModel.find({query}).lean()
}

export const updateSessions = async (query: FilterQuery<SessionDocument>, update: UpdateQuery<SessionDocument>) => {
    return SessionModel.updateOne(query, update)
}

export const reissueAccessToken = async ({refreshToken}:{refreshToken: string}) => {
    const {decoded} = verifyJwt(refreshToken);
    log.info(`In reissueAccessToken decoded is:`)
    log.info(decoded)
    if(!decoded || !get(decoded, "session")) return false;
    const session = await SessionModel.findById(get(decoded, "session"));
    log.info('Session is:')
    log.info(session)
    if(!session || !session.valid) return false;
    const user = await findUser({_id: session.user})
    log.info('User is:')
    log.info(user)
    if(!user) false;
    const accessToken = signJwt({...user, session: session._id}, {expiresIn: config.get<string>("accessTokenTtl")});
    log.info('New accessToken is:')
    log.info(accessToken)
    return accessToken;
}