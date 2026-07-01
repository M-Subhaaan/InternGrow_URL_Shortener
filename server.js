const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/database");

const port = process.env.PORT;

const startServer = async () => {
  try {
    await connectDB();

    const server = await app.listen(port, () => {
      console.log(`Server is running on port ${port}...`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
