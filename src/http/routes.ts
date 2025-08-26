import { Router } from "express";
import { usersRoutes } from "./controllers/users/routes";
import { datasetsRoutes } from "./controllers/datasets/routes";

export async function createMainRouter() {
  const router = Router()

  router.use(await usersRoutes());
  router.use(await datasetsRoutes());

  return router
}

