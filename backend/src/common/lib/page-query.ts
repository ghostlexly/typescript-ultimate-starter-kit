/**
 * Get pagination values from request query.
 * @example ?page=1&first=10
 * @param req
 * @returns
 */
const getPagination = ({ first, page }: { first?: number; page?: number }) => {
  // -- define limits
  if (!first || first > 100) {
    first = 50;
  }

  if (!page || page < 1) {
    page = 1;
  }

  const take = Number(first);
  const skip = (Number(page) - 1) * take;

  return {
    take,
    skip,
  };
};

/**
 * Get sorting values from request query.
 * @example ?sort=example_col_name:asc
 * @param req
 * @returns
 */
const getSorting = ({ sort }: { sort?: string }) => {
  if (!sort) return undefined;

  const [column, direction] = sort.toString().split(":");

  return {
    column,
    direction: direction.toLowerCase() as "asc" | "desc",
  };
};

/**
 * Get transformed data with pagination values.
 * @param data - Data array
 * @param totalItems - Total number of items
 * @param first - Number of items per page
 * @param page - Current page number
 * @returns Transformed data with pagination info
 */
const getTransformed = ({
  data,
  itemsCount,
  first,
  page,
}: {
  data: any;
  itemsCount: number;
  first?: number;
  page?: number;
}) => {
  const currentPage = page ? Number(page) : 1;
  const itemsPerPage = first ? Number(first) : 50;
  const pagesCount = Math.ceil(itemsCount / itemsPerPage);

  return {
    nodes: data,
    pagination: {
      currentPage,
      itemsPerPage,
      pagesCount,
      itemsCount,
    },
  };
};

/**
 * Page query helper.
 * @example
 * ```typescript
 * \@Get('/cities')
 * \@Public()
 * async cities(\@Query("page") page: number, \@Query("first") first: number, \@Query("sort") sort: string, \@Query('city') city: string) {
 *   const pagination = pageQuery.getPagination({ page, first });
 *   const sorting = pageQuery.getSorting({ sort });
 *   const where: Prisma.HousekeeperWhereInput = {};
 *   const orderBy: Prisma.HousekeeperOrderByWithRelationInput = {};
 *
 *   // Filters
 *   if (city) {
 *    where.city = {
 *      contains: city,
 *    };
 *   }
 *
 *   // Sorting
 *   if (sorting?.column === "informations_firstName") {
 *     orderBy.informations = {
 *       firstName: sorting.direction,
 *     };
 *   }
 *
 *   const { data, count } = await this.db.prisma.housekeeper.findManyAndCount({
 *     ...pagination,
 *     orderBy,
 *     where,
 *   });
 *
 *   return pageQuery.getTransformed({ data, totalItems: count, first, page });
 * }
 * ```
 */
export const pageQuery = {
  getPagination,
  getSorting,
  getTransformed,
};
