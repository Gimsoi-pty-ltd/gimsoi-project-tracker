/**
 * Generic validation middleware that parses request data against a Zod schema.
 * 
 * @param {object} schema - Zod schema object
 * @param {string} source - 'body' | 'query' | 'params' (default: 'body')
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
    try {
        const result = schema.parse(req[source]);
        
        // Express 5.x makes req.query a read-only getter.
        // We use Object.defineProperty to override it with our validated/coerced data.
        Object.defineProperty(req, source, {
            value: result,
            writable: true,
            configurable: true,
            enumerable: true
        });

        next();
    } catch (err) {
        // Delegate to the global error handler which handles ZodError specifically
        next(err);
    }
};
