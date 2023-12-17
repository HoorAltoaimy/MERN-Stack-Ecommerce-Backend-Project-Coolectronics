import { Schema, model, Document } from "mongoose";
import { dev } from "../config";

export interface UserInterface extends Document {
  //_id: string;
  username: string;
  email: string;
  password: string;
  image: string;
  address: string;
  phone: string;
  isAdmin: boolean;
  isBanned: boolean;
}

const userSchema = new Schema<UserInterface>(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [50, "Username name must be at most 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provid an email"],
      trim: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (value: string) {
          //value -> email
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
        },
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      required: [true, "Please provid a password"],
      trim: true,
      minlength: [6, "Password must be at least 3 characters"],
    },
    image: {
      type: String,
      default: dev.app.usersImgPath,
    },
    address: {
      type: String,
      required: [true, "Please provide an address"],
      trim: true,
      minlength: [3, "Address must be at least 3 characters"],
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number"],
      trim: true,
      minlength: [10, "Phone number must be at least 10 characters"],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },    
  { timestamps: true }
);

const User = model<UserInterface>("User", userSchema);
export default User;
