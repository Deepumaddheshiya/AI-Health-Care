module.exports = (req, res) => {
    res.status(200).json({
        message: "Vercel serverless functions are working! 🎉",
        timestamp: new Date().toISOString()
    });
};
