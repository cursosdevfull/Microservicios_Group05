import { Request, Response, NextFunction } from "express";

export interface IError extends Error {
  status?: number;
}

export default class ErrorsHelper {
  static asyncError(
    ftn: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      ftn(req, res, next).catch((err) => {
        let error: IError;

        if (err.code) {
          error = new Error("Database error");
          error.status = 500;
          error.message = err.message;
          error.stack = err.stack;
        } else {
          error = new Error("Async error");
          error.status = err.status;
          error.message = err.message;
          error.stack = err.stack;
        }

        next(error);
      });
    };
  }

  static pathNotFound(req: Request, res: Response, next: NextFunction) {
    const error: IError = new Error("Path not found");
    error.status = 404;
    next(error);
  }

  static genericError(
    err: IError,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const objError: IError = {
      name: err.name,
      message: err.message,
      status: err.status,
    };

    if (process.env.NODE_ENV === "development") {
      objError.stack = err.stack;
    }

    res.status(objError.status).json(objError);
  }
}
