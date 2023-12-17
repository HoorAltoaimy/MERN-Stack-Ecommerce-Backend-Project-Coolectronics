import {v2 as cloudinary} from 'cloudinary';
import { dev } from '.';
          
const myCloudinary = cloudinary.config({ 
  cloud_name: dev.cloud.cloudinaryName, 
  api_key: dev.cloud.cloudinaryApiKey, 
  api_secret: dev.cloud.cloudinaryApiSecret 
});

export default myCloudinary
