require("dotenv").config();
const app = require("./src/app");

const connectToDb = require("./src/config/database.js");

const PORT = process.env.PORT || 3000;

connectToDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error while connecting to database", error);
  });
