/**
 * Shared pagination helpers.
 *
 * Usage (in a controller):
 *   const { limit, cursor } = parsePagination(req.query);
 *   const records = await service.getMany(projectId, { limit, cursor });
 *   const { data, nextCursor } = buildPage(records, limit);
 *   return res.json({ success: true, data, nextCursor });
 */

/**
 * Parses limit and cursor from an Express query object.
 * limit defaults to 50, capped at 100. cursor is undefined when absent.
 *
 * @param {object} query — req.query
 * @returns {{ limit: number, cursor: string | undefined }}
 */
export const parsePagination = (query) => {
    const limit = Math.min(parseInt(query.limit) || 50, 100);
    const cursor = query.cursor || undefined;
    return { limit, cursor };
};

/**
 * Trims the +1 sentinel record returned by the service and derives nextCursor.
 * Services must fetch `limit + 1` records for this to work correctly.
 *
 * @param {Array} records  — raw records from the service (may be limit+1 in length)
 * @param {number} limit   — the limit used in the query
 * @returns {{ data: Array, nextCursor: string | null }}
 */
export const buildPage = (records, limit) => {
    const hasMore = records.length > limit;
    const data = hasMore ? records.slice(0, limit) : records;
    const nextCursor = hasMore ? data[data.length - 1].id : null;
    return { data, nextCursor };
};
