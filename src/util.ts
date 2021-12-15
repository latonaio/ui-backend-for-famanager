import { ParamsDictionary, RequestHandler } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

export type AsyncRequestHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  Locals extends Record<string, any> = Record<string, any>
> = RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> extends (...args: infer A) => unknown
  ? (...args: A) => Promise<void>
  : never;

export const asyncHandler = (handler: AsyncRequestHandler): RequestHandler => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      next(e);
    }
  };
};
