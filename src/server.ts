import { env } from './config/env';
import { prisma } from './lib/prisma';
import { app } from './app';


app.get('/', (req, res) => {
  res.send('Finance Dashboard API is running 🚀');
});

const server = app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
  console.log(`Swagger docs at http://localhost:${env.PORT}/docs`);
});

const gracefulShutdown = async () => {
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
