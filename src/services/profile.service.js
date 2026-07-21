const mongoose = require('mongoose');

const Listing = require('../models/Listing');
const User = require('../models/User');
const { isManagedAvatarPath } = require('../utils/avatarStorage');

const RECENT_LISTINGS_LIMIT = 4;
const PROFILE_USER_NOT_FOUND = 'PROFILE_USER_NOT_FOUND';
const PROFILE_USER_NOT_FOUND_MESSAGE = 'Không tìm thấy tài khoản.';
const INVALID_PROFILE_AVATAR = 'INVALID_PROFILE_AVATAR';
const INVALID_PROFILE_AVATAR_MESSAGE = 'Ảnh đại diện không hợp lệ.';
const SAFE_USER_FIELDS =
  '_id name email phone avatar address role status createdAt updatedAt';

const createProfileError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const getProfileUser = (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    return null;
  }

  return User.findById(userId).select(SAFE_USER_FIELDS).lean();
};

const getProfileOverview = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    return null;
  }

  const sellerFilter = { seller: userId };
  const [profileUser, activeListings, soldListings, hiddenListings, recentListings] =
    await Promise.all([
      getProfileUser(userId),
      Listing.countDocuments({ ...sellerFilter, status: 'active' }),
      Listing.countDocuments({ ...sellerFilter, status: 'sold' }),
      Listing.countDocuments({ ...sellerFilter, status: 'hidden' }),
      Listing.find(sellerFilter)
        .select(
          'title price category location condition images status createdAt updatedAt',
        )
        .populate('category', 'name slug')
        .sort({ createdAt: -1, _id: -1 })
        .limit(RECENT_LISTINGS_LIMIT)
        .lean(),
    ]);

  if (!profileUser) {
    return null;
  }

  return {
    profileUser,
    stats: {
      totalListings: activeListings + soldListings + hiddenListings,
      activeListings,
      soldListings,
      hiddenListings,
    },
    recentListings,
  };
};

const updateProfile = async (userId, data) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw createProfileError(
      PROFILE_USER_NOT_FOUND,
      PROFILE_USER_NOT_FOUND_MESSAGE,
    );
  }

  const user = await User.findById(userId).select(SAFE_USER_FIELDS);

  if (!user) {
    throw createProfileError(
      PROFILE_USER_NOT_FOUND,
      PROFILE_USER_NOT_FOUND_MESSAGE,
    );
  }

  const nextAvatar = typeof data.avatar === 'string' ? data.avatar : user.avatar;
  const avatarIsAllowed =
    nextAvatar === '' ||
    nextAvatar === user.avatar ||
    isManagedAvatarPath(nextAvatar);

  if (!avatarIsAllowed) {
    throw createProfileError(
      INVALID_PROFILE_AVATAR,
      INVALID_PROFILE_AVATAR_MESSAGE,
    );
  }

  user.name = typeof data.name === 'string' ? data.name.trim() : '';
  user.phone = typeof data.phone === 'string' ? data.phone.trim() : '';
  user.address = typeof data.address === 'string' ? data.address.trim() : '';
  user.avatar = nextAvatar;

  return user.save();
};

module.exports = {
  INVALID_PROFILE_AVATAR,
  INVALID_PROFILE_AVATAR_MESSAGE,
  PROFILE_USER_NOT_FOUND,
  PROFILE_USER_NOT_FOUND_MESSAGE,
  RECENT_LISTINGS_LIMIT,
  getProfileOverview,
  getProfileUser,
  updateProfile,
};
