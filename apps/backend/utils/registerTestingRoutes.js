/**
 * Test-only routes. Loaded only when NODE_ENV === 'test'.
 */
export default async function registerTestingRoutes(app) {
    if (process.env.NODE_ENV === 'test') {
        const { default: testingRoutes } = await import('../routes/testing.route.js');
        app.use('/api/testing', testingRoutes);
    }
}
