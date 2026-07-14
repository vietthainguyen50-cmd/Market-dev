require('dotenv').config();

const mongoose = require('mongoose');

const app = require('./src/app');
const connectDatabase = require('./src/config/database');

const PORT = process.env.PORT || 3000;

let server;
let isShuttingDown = false;

const closeHttpServer = () =>
  new Promise((resolve, reject) => {
    if (!server || !server.listening) {
      resolve();
      return;
    }

    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const closeDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('MongoDB connection closed successfully');
  }
};

const shutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`${signal} received. Shutting down gracefully...`);

  try {
    await closeHttpServer();
    await closeDatabase();
    console.log('NTT Marketplace stopped successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error while shutting down:', error.message);
    process.exitCode = 1;
  }
};

const handleServerError = async (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Không thể khởi động: cổng ${PORT} đang được sử dụng.`);
  } else {
    console.error('Không thể khởi động NTT Marketplace:', error.message);
  }

  process.exitCode = 1;

  try {
    await closeDatabase();
  } catch (closeError) {
    console.error('Không thể đóng kết nối MongoDB:', closeError.message);
  }
};

const startServer = async () => {
  try {
    await connectDatabase();

    server = app.listen(PORT, () => {
      console.log(`NTT Marketplace đang chạy tại http://localhost:${PORT}`);
    });

    server.on('error', handleServerError);
  } catch (error) {
    if (isShuttingDown) {
      return;
    }

    console.error(
      'Không thể khởi động NTT Marketplace vì kết nối MongoDB không thành công.',
    );
    process.exitCode = 1;
  }
};

process.once('SIGINT', () => {
  void shutdown('SIGINT');
});

process.once('SIGTERM', () => {
  void shutdown('SIGTERM');
});

void startServer();
