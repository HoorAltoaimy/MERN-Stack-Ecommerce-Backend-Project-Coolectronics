import 'dotenv/config'
export const dev = {
  app: {
    port: Number(process.env.PORT),

    secret_key: String(process.env.secret_key),
    access_key: String(process.env.access_key),

    productsImgPath: process.env.PRODUCTS_DEFAULT_IMAGE_PATH,
    usersImgPath: process.env.USERS_DEFAULT_IMAGE_PATH,
    jwtUserActivationKey: process.env.JWT_USER_ACTIVATION_KEY,
    jwtResetPasswordKey: process.env.JWT_PASSWORD_RESET_KEY,
    jwtAccessKey: process.env.JWT_ACCESS_KEY,
    smtpUsername: process.env.SMTP_USERNAME,
    smtpPassword: process.env.SMTP_PASSWORD,
    braintreeMerchantId: process.env.BRAINTREE_MERCHANT_ID,
    braintreePublicKey: process.env.BRAINTREE_PUBLIC_KEY,
    braintreePrivateKey: process.env.BRAINTREE_PRIVATE_KEY
  },
  db: {
    url: process.env.MONGODB_URL,
  },
  cloud: {
    cloudinaryName: process.env.CLOUDINARY_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET_KEY,
  },
}
