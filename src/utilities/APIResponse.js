class APIResponse {
  constructor(statusCode, message = "Success", data) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
  }

  static success(res, statusCode, message, data) {
    return res.status(statusCode).json(new APIResponse(statusCode, message, data));
  }
}

module.exports = { APIResponse };