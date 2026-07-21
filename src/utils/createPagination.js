const buildListingQuery = require('./buildListingQuery');

const PAGE_WINDOW_SIZE = 5;

const buildListingUrl = (filters, page) => {
  const query = buildListingQuery(filters, page);
  return query ? `/listings?${query}` : '/listings';
};

const createPagination = (pagination, filters) => {
  const { page, totalPages, hasPrev, hasNext } = pagination;
  const halfWindow = Math.floor(PAGE_WINDOW_SIZE / 2);
  let startPage = Math.max(1, page - halfWindow);
  let endPage = Math.min(totalPages, startPage + PAGE_WINDOW_SIZE - 1);

  startPage = Math.max(1, endPage - PAGE_WINDOW_SIZE + 1);

  const pages = [];

  for (let pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
    pages.push({
      number: pageNumber,
      isCurrent: pageNumber === page,
      url: buildListingUrl(filters, pageNumber),
    });
  }

  return {
    ...pagination,
    pages,
    firstUrl: page > 1 ? buildListingUrl(filters, 1) : null,
    previousUrl: hasPrev ? buildListingUrl(filters, page - 1) : null,
    nextUrl: hasNext ? buildListingUrl(filters, page + 1) : null,
    lastUrl: page < totalPages ? buildListingUrl(filters, totalPages) : null,
  };
};

module.exports = {
  buildListingUrl,
  createPagination,
};
