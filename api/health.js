module.exports = (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Diagnostic health check successful',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL
    });
};
