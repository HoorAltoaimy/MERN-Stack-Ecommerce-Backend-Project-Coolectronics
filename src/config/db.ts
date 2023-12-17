import moogoose from 'mongoose'
import { dev } from '.'

export const connectDB = async () => {
  try {
    await moogoose.connect(String(dev.db.url))
    console.log('db is Connected!')
  } catch (error) {
    console.error(error)
  }
}
