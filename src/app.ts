import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { setupSwagger } from './docs/swagger';
import { errorMiddleware } from './middlewares/error.middleware';
import { globalApiLimiter } from './middlewares/rateLimit.middleware';
import { router } from './routes';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(globalApiLimiter);
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use('/', router);
setupSwagger(app);

app.use(errorMiddleware);
