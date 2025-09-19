import { Router } from "express";

import { verifyJwt } from "../../middlewares/verify-jwt";
import { fileUpload } from "../../middlewares/file-upload";
import { uploadAndParseDataset } from "./upload-and-parse-dataset";

import { fetchDatasets } from "./fetch-datasets";

export async function datasetsRoutes() {
  const routes = Router();

  routes.post('/datasets/upload',
    verifyJwt,
    fileUpload,
    uploadAndParseDataset
  );

  routes.get('/datasets',
    verifyJwt,
    fetchDatasets
  );

  return routes;
}