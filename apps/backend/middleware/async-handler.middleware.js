/**
 * Wraps an async function to ensure any errors are passed to the next() middleware.
 * Prevents the need for repetitive try/catch blocks in controllers.
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
