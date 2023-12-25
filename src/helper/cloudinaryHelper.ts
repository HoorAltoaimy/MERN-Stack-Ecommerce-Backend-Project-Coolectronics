import { cloudinary } from '../config/cloudinary'
import ApiError from '../errors/ApiError'

export const uploadToCloudinary = async (image: string, folderName: string): Promise<string> => {
  const response = await cloudinary.uploader.upload(image, {
    folder: folderName,
  })
  return response.secure_url
}

export const valueWithoutExtension = async (imageUrl: string): Promise<string> => {
  //split the url by slashes to get an array of path segments
  const pathSegments = imageUrl.split('/')

  //get the last segment
  const lastSegment = pathSegments[pathSegments.length - 1]

  //remove the file extinsion (e.g.: .png) from the last segment
  const valueWithoutExtension = lastSegment.replace(/\.(jpg|jpeg|png)$/i, '')

  return valueWithoutExtension
}

export const deleteFromcloudinary = async (publicId: string): Promise<void> => {
  try {
    const response = await cloudinary.uploader.destroy(publicId)
    if (response.result !== 'ok') {
      throw new ApiError(400, 'Image was not deleted from cloudinary')
    }
    console.log('Image was deleted from cloudinary')
  } catch (error) {
    throw error
  }
}
