const dns = require('node:dns');
const mongoose = require('mongoose');

const sanitizeErrorMessage = (message) =>
  String(message).replace(
    /(mongodb(?:\+srv)?:\/\/)([^@\s]+)@/gi,
    '$1***:***@',
  );

const configureDnsServers = () => {
  const dnsServers = process.env.MONGODB_DNS_SERVERS
    ?.split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (dnsServers?.length) {
    dns.setServers(dnsServers);
  }
};

const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        'MONGODB_URI chưa được cấu hình. Hãy thêm biến này vào file .env.',
      );
    }

    configureDnsServers();

    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    const { host, name } = connection.connection;
    console.log(`MongoDB connected successfully (${host}/${name})`);

    return connection;
  } catch (error) {
    console.error(
      'MongoDB connection failed:',
      sanitizeErrorMessage(error.message),
    );
    throw error;
  }
};

module.exports = connectDatabase;
