import * as express from 'express';
import { Logger } from '@nestjs/common';

export function logger(req: express.Request, res: express.Response, next) {
    if (req && req.method !== 'HEAD')
        Logger.log(formatRequest(req));
    next();
}

function formatRequest(req: express.Request) {
    return JSON.stringify({
        url: req.url,
        method: req.method,
        params: req.params,
        body: req.body,
        query: req.query,
        // token: req.headers.authorization,
    });
}