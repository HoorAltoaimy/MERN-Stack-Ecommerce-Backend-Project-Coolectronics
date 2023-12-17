import { validationResult } from 'express-validator'

import { Request, Response, NextFunction } from 'express'

export const runValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)

    let errList = errors.array().map((err: { msg: string }) => err.msg)

    return res.status(422).send({
      message: errList[0],
    })
  }
  next()
}
