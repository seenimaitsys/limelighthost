export class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super();
    this.status = "error";
    this.statusCode = statusCode;
    this.message = message;
  }
}

export const handleError = (err, req, res, next) => {
  const { statusCode, message } = err;
  res.status(statusCode).json({
    status: "error",
    statusCode: statusCode || 500,
    message,
  });
  next();
};
