//
// 🌐 Global Error Handling Middleware
//
const errorHandler = (err, req, res, next) => {
  console.error("🔥 Error:", err);

  // Default status code (500 = internal server error)
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
    // show stack trace only in development
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorHandler;
