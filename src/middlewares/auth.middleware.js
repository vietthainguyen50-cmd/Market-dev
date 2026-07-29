const User = require('../models/User');
const { isManagedAvatarPath } = require('../utils/avatarStorage');

const DEFAULT_AVATAR = '/images/default-avatar.svg';

const loadCurrentUser = async (req, res, next) => {
  req.user = null;
  res.locals.currentUser = null;
  res.locals.isAuthenticated = false;

  const userId = req.session?.userId;

  if (!userId) {
    return next();
  }

  try {
    const user = await User.findById(userId)
      .select('_id name email avatar role status')
      .lean();

    if (user?.status === 'active') {
      user.avatarUrl = isManagedAvatarPath(user.avatar)
        ? user.avatar
        : DEFAULT_AVATAR;
      req.user = user;
      res.locals.currentUser = user;
      res.locals.isAuthenticated = true;
      return next();
    }

    delete req.session.userId;
    return next();
  } catch (error) {
    return next(error);
  }
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.redirect(303, '/login');
  }

  return next();
};

const requireGuest = (req, res, next) => {
  if (req.user) {
    return res.redirect(303, '/');
  }

  return next();
};

module.exports = {
  loadCurrentUser,
  requireAuth,
  requireGuest,
};
