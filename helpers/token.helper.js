import jwt from 'jsonwebtoken';
import ENVARS from '../libs/envvars.js';
import Log from '../models/log.model.js';
import { db } from '../libs/firebase.js';

/**
 * This is function to generate access token and set it in httpOnly cookie, for the security purpose
 * @param {*} payload, the data to be stored in the token: accountId, role
 * @param {*} response, the express response object
 * @returns, the generated access token
 */
export const generateAccessToken = (payload, response) => {
    const token = jwt.sign(payload, ENVARS.JWT_ACCESS_SECRET, { 
        expiresIn: '15m',
        algorithm: 'HS384' 
    });

    // response.cookie('accessToken', token, {
    //     httpOnly: true,
    //     secure: ENVARS.NODE_ENV === 'production',
    //     sameSite: 'lax',
    //     maxAge: 15 * 60 * 1000 
    // })

    return token;
}

/**
 * This function is to generate refresh token and set it in httpOnly cookie, for the security purpose. 
 * In order to make the zero-trust architecture, the refresh token is stored in httpOnly cookie, so it cannot be accessed by client-side javascript
 * The refresh token is valid for 3 days, and it can be used to generate new access token when the access token is expired 
 * @param {*} payload, the data to be stored in the token: accountId, role
 * @param {*} response, the express response object
 * @returns, the generated refresh token
 */
export const generateRefreshToken = (payload, response) => {
    const refreshToken = jwt.sign(payload, ENVARS.JWT_REFRESH_SECRET, { 
        expiresIn: '3d',
        algorithm: 'HS384' 
    });

    // response.cookie('refreshToken', refreshToken, {
    //     httpOnly: true,
    //     secure: ENVARS.NODE_ENV === 'production',
    //     sameSite: 'lax',
    //     maxAge: 3 * 24 * 60 * 60 * 1000 
    // })

    return refreshToken;
}

/**
 * This function is to decode the access token and return the decoded data
 * @param {string} token
 * @returns decoded token 
 */
export const decodeAccessToken = async (token) => {
    try {
        const decoded = jwt.verify(token, ENVARS.JWT_ACCESS_SECRET, { algorithms: ['HS384'] });

        if (!decoded) {
            const log = new Log({
                action: `Invalid access token decode attempt`,
                timestamp: new Date(),
            })

            await db.collection('logs').add(log.toFirestore());

            throw new Error('Invalid token');
        }

        const log = new Log({
            action: `Successful access token decode attempt`,
            timestamp: new Date(),
        })

        await db.collection('logs').add(log.toFirestore());

        return decoded;

    } catch (error) {
        const log = new Log({
            action: `Invalid access token decode attempt`,
            timestamp: new Date(),
        })

        await db.collection('logs').add(log.toFirestore());

        throw new Error('Invalid access token');
    }
}

/**
 * This function is to decode the access token and return the decoded data
 * @param {string} token
 * @returns decoded token 
 */
export const decodeRefreshToken = async (token) => {
    try {
        const decoded = jwt.verify(token, ENVARS.JWT_REFRESH_SECRET, { algorithms: ['HS384'] });

        if (!decoded) {
            const log = new Log({
                action: `Invalid refresh token decode attempt`,
                timestamp: new Date(),
            })

            await db.collection('logs').add(log.toFirestore());

            throw new Error('Invalid refresh token');
        }

        const log = new Log({
            action: `Successful refresh token decode attempt`,
            timestamp: new Date(),
        })

        await db.collection('logs').add(log.toFirestore());

        return decoded;

    } catch (error) {
        const log = new Log({
            action: `Invalid refresh token decode attempt`,
            timestamp: new Date(),
        })

        await db.collection('logs').add(log.toFirestore());

        throw new Error('Invalid refresh token');
    }
}

/**
 * This function is for checking if token experied or not
 * @param {string} token 
 * @returns, is experied or not
 */
export function isTokenExpired(token) {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    return Math.floor(Date.now() / 1000) >= decoded.exp; 
  } catch (e) {
    return true;
  }
}