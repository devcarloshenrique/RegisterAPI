import { authenticateDoc } from "./users/authenticate.doc";
import { profileDoc } from "./users/profile.doc";
import { registerDoc } from "./users/register.doc";

export const swaggerPaths = {
  ...registerDoc,
  ...authenticateDoc,
  ...profileDoc
}