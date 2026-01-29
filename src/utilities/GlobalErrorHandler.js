require("dotenv").config();

const developmentResponse = (error, res) => {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    statusCode: error.statusCode,
    message: error.message,
    data: error.data,
    errorStack: error.stack,
  });
};

const productionResponse = (error, res) => {
  const statusCode = error.statusCode || 500;
  if (error.isOperationalError) {
    return res.status(statusCode).json({
      statusCode: error.statusCode,
      message: error.message,
    });
  } else {
    return res.status(statusCode).json({
      status: "!OK",
      message: "Something went wrong, please try again later!",
    });
  }
};

exports.GlobalErrorHandler = (error, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    developmentResponse(error, res);
  } else {
    productionResponse(error, res);
  }
};