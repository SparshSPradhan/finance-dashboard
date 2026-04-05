import { Express } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Dashboard Backend API',
      version: '1.0.0',
      description:
        'Backend APIs for finance data processing and RBAC. All routes except `/health` and `/auth/login` require a Bearer JWT.'
    },
    servers: [{ url: 'http://localhost:4000' }],
    tags: [
      { name: 'Health', description: 'Public health check' },
      { name: 'Auth', description: 'Authentication' },
      { name: 'Users', description: 'User management (ADMIN)' },
      { name: 'Records', description: 'Financial records' },
      { name: 'Dashboard', description: 'Aggregated dashboard data' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  // Include nested `*.route.ts` files — full paths are documented there (e.g. `/auth/login`, not `/login`).
  apis: ['src/routes/index.ts', 'src/modules/**/*.route.ts']
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
