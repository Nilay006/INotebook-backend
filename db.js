const mongoose = require("mongoose");
const mongoURI =
  "mongodb+srv://chahodiyanilay30:90670Nilay@inootbook.fuw9dh0.mongodb.net/INootbook";

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
};

module.exports = connectToMongo;
