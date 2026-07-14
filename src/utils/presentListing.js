const formatPrice = require('./formatPrice');

const conditionLabels = {
  new: 'Mới',
  used: 'Đã sử dụng',
};

const statusLabels = {
  active: 'Đang bán',
  sold: 'Đã bán',
  hidden: 'Đã ẩn',
};

const presentListing = (listing) => {
  const data = listing?.toObject ? listing.toObject() : listing;

  return {
    ...data,
    formattedPrice: formatPrice(data.price),
    formattedCreatedAt: new Intl.DateTimeFormat('vi-VN').format(
      data.createdAt,
    ),
    conditionLabel: conditionLabels[data.condition] || data.condition,
    statusLabel: statusLabels[data.status] || data.status,
  };
};

module.exports = presentListing;
