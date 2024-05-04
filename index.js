const connectToMongo = require("./db");
const express = require("express");
var cors = require("cors");
connectToMongo();

const app = express();
const port = 5001;

// Use middleware for get data in json form
app.use(express.json());
app.use(cors());

//Available routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.get("/", (req, res) => {
  res.send("Hello world !");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
