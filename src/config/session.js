const session = require('express-session');
const connectMongo = require('connect-mongo');

const MongoStore =
  connectMongo.MongoStore || connectMongo.default || connectMongo;

const DEFAULT_COOKIE_NAME = 'ntt_marketplace_sid';
const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const getSessionCookieName = () =>
  process.env.SESSION_COOKIE_NAME || DEFAULT_COOKIE_NAME;

const getSessionMaxAge = () => {
  const configuredValue = Number(process.env.SESSION_MAX_AGE_MS);

  if (!process.env.SESSION_MAX_AGE_MS) {
    return DEFAULT_MAX_AGE_MS;
  }

  if (!Number.isSafeInteger(configuredValue) || configuredValue <= 0) {
    throw new Error('SESSION_MAX_AGE_MS phải là một số nguyên dương.');
  }

  return configuredValue;
};

const createSessionMiddleware = () => {
  const { MONGODB_URI: mongoUrl, SESSION_SECRET: secret } = process.env;

  if (!secret) {
    throw new Error(
      'SESSION_SECRET chưa được cấu hình. Hãy thêm một secret mạnh vào file .env.',
    );
  }

  if (!mongoUrl) {
    throw new Error(
      'MONGODB_URI chưa được cấu hình nên không thể khởi tạo session store.',
    );
  }

  const store = MongoStore.create({
    mongoUrl,
    collectionName: 'sessions',
  });

  store.on('error', (error) => {
    const errorName = error?.name || 'UnknownError';
    console.error(`MongoDB session store gặp lỗi (${errorName}).`);
  });

  return session({
    name: getSessionCookieName(),
    secret,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: getSessionMaxAge(),
      path: '/',
    },
  });
};

module.exports = {
  createSessionMiddleware,
  getSessionCookieName,
};
