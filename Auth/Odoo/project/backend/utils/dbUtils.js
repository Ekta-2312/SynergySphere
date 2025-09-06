/**
 * Database utilities for handling soft deletes and common operations
 */

/**
 * Soft delete query helper
 * Adds isDeleted: { $ne: true } to query filters
 * @param {Object} filter - Original query filter
 * @returns {Object} Updated filter with soft delete condition
 */
function addSoftDeleteFilter(filter = {}) {
  return {
    ...filter,
    isDeleted: { $ne: true }
  };
}

/**
 * Include deleted items query helper
 * Returns the original filter without soft delete filtering
 * @param {Object} filter - Original query filter
 * @returns {Object} Original filter unchanged
 */
function includeDeleted(filter = {}) {
  return filter;
}

/**
 * Only deleted items query helper
 * Adds isDeleted: true to query filters
 * @param {Object} filter - Original query filter
 * @returns {Object} Updated filter to show only deleted items
 */
function onlyDeleted(filter = {}) {
  return {
    ...filter,
    isDeleted: true
  };
}

/**
 * Aggregate pipeline helper for soft delete filtering
 * @param {Array} pipeline - Original aggregation pipeline
 * @returns {Array} Pipeline with soft delete filtering added
 */
function addSoftDeleteToPipeline(pipeline = []) {
  return [
    { $match: { isDeleted: { $ne: true } } },
    ...pipeline
  ];
}

/**
 * Pagination helper
 * @param {Object} options - Pagination options
 * @param {Number} options.page - Page number (1-based)
 * @param {Number} options.limit - Items per page
 * @param {Object} options.sort - Sort criteria
 * @returns {Object} Skip and limit values for pagination
 */
function getPaginationOptions(options = {}) {
  const page = Math.max(1, parseInt(options.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 10));
  const skip = (page - 1) * limit;
  
  return {
    skip,
    limit,
    sort: options.sort || { createdAt: -1 }
  };
}

/**
 * Search helper for text search across multiple fields
 * @param {String} searchTerm - Search term
 * @param {Array} fields - Fields to search in
 * @returns {Object} MongoDB text search query
 */
function createTextSearchQuery(searchTerm, fields = []) {
  if (!searchTerm) return {};
  
  const regex = new RegExp(searchTerm, 'i');
  const searchConditions = fields.map(field => ({
    [field]: { $regex: regex }
  }));
  
  return searchConditions.length > 0 ? { $or: searchConditions } : {};
}

/**
 * Date range filter helper
 * @param {String|Date} startDate - Start date
 * @param {String|Date} endDate - End date
 * @param {String} field - Field name for date filtering
 * @returns {Object} Date range query
 */
function createDateRangeQuery(startDate, endDate, field = 'createdAt') {
  const query = {};
  
  if (startDate || endDate) {
    query[field] = {};
    
    if (startDate) {
      query[field].$gte = new Date(startDate);
    }
    
    if (endDate) {
      query[field].$lte = new Date(endDate);
    }
  }
  
  return query;
}

/**
 * Build common aggregation pipeline for listing with population
 * @param {Object} matchConditions - Match conditions
 * @param {Array} populateFields - Fields to populate
 * @param {Object} sortOptions - Sort options
 * @param {Object} paginationOptions - Pagination options
 * @returns {Array} Aggregation pipeline
 */
function buildListingPipeline(matchConditions = {}, populateFields = [], sortOptions = {}, paginationOptions = {}) {
  const pipeline = [];
  
  // Match stage with soft delete filtering
  pipeline.push({
    $match: addSoftDeleteFilter(matchConditions)
  });
  
  // Populate fields
  populateFields.forEach(({ from, localField, foreignField = '_id', as }) => {
    pipeline.push({
      $lookup: {
        from,
        localField,
        foreignField,
        as
      }
    });
    
    // Unwind if single document expected
    if (!as.endsWith('s') && !as.includes('List')) {
      pipeline.push({
        $unwind: {
          path: `$${as}`,
          preserveNullAndEmptyArrays: true
        }
      });
    }
  });
  
  // Sort stage
  if (Object.keys(sortOptions).length > 0) {
    pipeline.push({ $sort: sortOptions });
  }
  
  // Pagination
  if (paginationOptions.skip !== undefined) {
    pipeline.push({ $skip: paginationOptions.skip });
  }
  
  if (paginationOptions.limit !== undefined) {
    pipeline.push({ $limit: paginationOptions.limit });
  }
  
  return pipeline;
}

module.exports = {
  addSoftDeleteFilter,
  includeDeleted,
  onlyDeleted,
  addSoftDeleteToPipeline,
  getPaginationOptions,
  createTextSearchQuery,
  createDateRangeQuery,
  buildListingPipeline
};
