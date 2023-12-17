import jwt from "jsonwebtoken";
import ApiError from "../errors/ApiError";

export const createJsonWebToken = (
  tokenPayload: object,
  secretKey: string,
  expiresIn: string
) => {
  try {
    if(!tokenPayload || Object.keys(tokenPayload).length === 0){
        throw new ApiError(404, 'token payload must be a non-empty object')
    }

    if (secretKey === "" || typeof secretKey !== "string") {
        throw new ApiError(404, "Secret key must be a non-empty string");
    }

    const token = jwt.sign(tokenPayload, secretKey, {
      expiresIn: expiresIn,
    });

    return token;
  } catch (error) {
    throw error 
  }
};

export const verifyJsonWebToken = (token: string, secretKey: string) => {
  const decoded = jwt.verify(token, secretKey);

  return decoded;
};
