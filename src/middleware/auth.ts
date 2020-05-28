const jwt = require('jsonwebtoken')
import { secret, login, password } from '../config/config';
import { verify } from 'jsonwebtoken';

export const authMiddleWare = (req: any, res: any, next: Function) => {
    const token = req.get('Authorization');
    if(req.method === "OPTIONS") {
        next();
    }
    if (!token) {
        res.status(401).json({ error: 'Токен отсутствует' });
    } else {
        try {
            verify(token, secret)
            next();
        } catch (e) {
            if (e instanceof jwt.JsonWebTokenError) {
                res.status(401).json({ error: 'Поврежденный токен' })
            }
        }
    }
}