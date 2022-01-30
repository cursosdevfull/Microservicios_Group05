import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  itemCount: {
    type: Number,
    required: true,
  },

  transaction: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    required: true,
  },
});

const model = mongoose.model("Payment", schema);

export default model;
