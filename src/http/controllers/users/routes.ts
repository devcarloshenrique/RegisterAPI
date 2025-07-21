import { Router } from "express"
import { register } from "./register"
import { authenticate } from "./authenticate"
import { profile } from "./profile"
import { verifyJwt } from "../../middlewares/verify-jwt"

export async function usersRoutes() {
  const routes = Router()

  routes.post('/auth/register', register)
  routes.post('/auth/login', authenticate)
  
  
  routes.get('/me', verifyJwt, profile)

  return routes
}
