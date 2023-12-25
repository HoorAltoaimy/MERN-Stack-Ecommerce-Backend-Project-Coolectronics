export interface Error {
  status?: number
  message?: string
}

export type CategoryType = {
  title: string
  slug?: string
}

export type CategoryInput = Omit<CategoryType, 'title'>

export interface ErrorInterface {
  status?: number
  message?: string
}

export type ProductType = {
  _id: string;
  title: string;
  slug: string;
  price: number;
  image: string;
  description: string;
  category: String;
  quantity: number; 
  sold: number; 
  shipping: number;
}

export type ProductInput = Omit<ProductType, '_id'>; //or use Partial<ProductType>

export interface Error {
  status?: number;
  message?: string
}

export type EmaileDataType = {
  email: string;
  subject: string;
  html: string;
}

export type UserType = {
  username: string;
  email: string;
  password?: string;
  address: string;
  phone: string;
  image?: string;
}

