import multer from "multer";
import { uploadConfig } from "../../infra/upload/multer";

export const fileUpload = multer(uploadConfig).single("file");
