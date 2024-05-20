const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const routes = require("./Routes/Main"); 

const app = express();
dotenv.config();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());


app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
