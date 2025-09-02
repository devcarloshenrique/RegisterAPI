import swaggerJSDoc from 'swagger-jsdoc';
import { swaggerPaths } from '../paths';

export const swaggerConfig: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Processamento de Arquivos',
      version: '1.0.0',
      description: 'Documentação da API com Express e Swagger',
    },
    servers: [
      {
        url: 'http://localhost:3333/api/',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter the JWT token in the format: Bearer <token>'
        }
      }
    },
    paths: swaggerPaths,
  },
  apis: ['src/http/controllers/**/*.ts'],
};