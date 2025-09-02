import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from 'swagger-ui-express';
import { swaggerConfig } from "./config";

const swaggerSpec = swaggerJSDoc(swaggerConfig);

export { swaggerSpec, swaggerUi };

