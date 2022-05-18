import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-happy-thoughts-api";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

const ThoughtsSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140
  },
  hearts: {
    type: Number,
    default: 0
  }, 
  createdAt: {
    type: Date,
    default: ()=> new Date()
  }
});

const thought = mongoose.model("thought", ThoughtsSchema);

app.get("/", (req, res) => {
  res.send("Happy thougts api");
});

app.get("/thoughts", async (req, res) => {
  try {
    const thoughts = await thought.find().sort({ createdAt: "desc" }).limit(20).exec();
    res.status(200).json(thoughts);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.errors
    });
  }
});

app.post("/thoughts", async (req, res) => {
  const { message, hearts } = req.body;

  try {
    const newThought = await new thought({ message, hearts }).save();
    res.status(200).json({
      response: newThought, 
      success: true
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.errors
    });
  }
});

app.post("/thoughts/:thoughtId/like", async (req, res) => {
  const { thoughtId } = req.params;
  
  try {
    const thoughtToLike = await thought.findByIdAndUpdate(thoughtId, { $inc: { hearts: 1 } })
    res.status(200).json({
      response: thoughtToLike,
      success: true
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.errors
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
