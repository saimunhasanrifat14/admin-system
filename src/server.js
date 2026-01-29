require("dotenv").config();
const { connectDB } = require("./database/db");
const app = require("./app");

const port = process.env.PORT;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log("DB Connection Failed", err);
  });