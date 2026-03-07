import { NextFunction, Request, Response, Router } from "express";
import z from "zod";
const validateRequest = (zodSchema: z.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data) //for files
    }
    const parseData = zodSchema.safeParse(req.body)
    if (!parseData.success) {
      next(parseData.error)
    }
    req.body = parseData.data
    next()
  }
}



export default validateRequest