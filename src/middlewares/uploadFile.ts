import { Request } from 'express'
import multer, { FileFilterCallback } from 'multer'

const productsStorage = multer.diskStorage({
  // destination: function (req: Request, file: Express.Multer.File, cb) {
  //   cb(null, 'public/images/productsImages')
  // },
  filename: function (req: Request, file: Express.Multer.File, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  },
})

const usersStorage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   cb(null, 'public/images/usersimages')
  // },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  },
})

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  //file types that are allowed
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']

  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('File should be an image'))
  }
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Image type is not allowed'))
  }
  cb(null, true)
}

export const uploadProductImg = multer({
  storage: productsStorage,
  limits: { fileSize: 1024 * 1024 * 1 },
  fileFilter: fileFilter,
})

export const uploadUserImg = multer({ storage: usersStorage })
