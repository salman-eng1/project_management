const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const dbConnection = require("./config/database");
const projectRoute = require("./routes/projectRoute");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");

const globalError = require("./middlewares/errorMiddleware");


dotenv.config({ path: ".env" });

// Your other code follows...
dbConnection();

const app = express();

app.use(express.json());
app.use("/api/v1/projects", projectRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/auth", authRoute);




app.use(globalError);

if (process.env.NODE_ENV == "development") {
    app.use(morgan("dev"));
    console.log(`mode: ${process.env.NODE_ENV}`);
  }
const port = process.env.PORT;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

//handle rejections outside express
//any function that have no ".catch" will trigger an event called "unhandledRejection"
// we listen to this event to handle this on premise errors globaly
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Error: ${err.name} | ${err.messaage}`);
  server.close(() => {
    //to stop accepting incoming requests
    console.log("shutting down .....");
    process.exit(1); //exit node js & stop the server
  });
});