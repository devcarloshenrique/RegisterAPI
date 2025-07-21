import { Router } from "express";
import { verifyJwt } from "../../middlewares/verify-jwt";
import { fileUpload } from "../../middlewares/file-upload";
import { fileMetadata } from "../../middlewares/file-metadata";
import { upload } from "./upload";
import { parsePDF } from "../../middlewares/pdf-parse";

export async function datasetsRoutes() {
  const routes = Router();

  routes.post('/datasets/upload',
    verifyJwt,
    fileUpload,
    fileMetadata,
    upload,
    parsePDF
  );

  return routes;
}