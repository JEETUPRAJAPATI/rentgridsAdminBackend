export const getPagination = (page = 1, limit = 20) => {
  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page
  const skip = (pageNumber - 1) * limitNumber;

  return {
    skip,
    limit: limitNumber
  };
};

export const getPaginationInfo = (page, limit, total) => {
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  
  return {
    page: pageNumber,
    pages: Math.ceil(total / limitNumber),
    total,
    limit: limitNumber,
    hasNext: pageNumber < Math.ceil(total / limitNumber),
    hasPrev: pageNumber > 1
  };
};