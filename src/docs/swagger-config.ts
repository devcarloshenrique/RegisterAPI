import { authenticateDoc } from "../http/controllers/users/docs/authenticate.doc";
import { profileDoc } from "../http/controllers/users/docs/profile.doc";
import { registerDoc } from "../http/controllers/users/docs/register.doc";

export const swaggerPaths = {
  ...registerDoc,
  ...authenticateDoc,
  ...profileDoc
}