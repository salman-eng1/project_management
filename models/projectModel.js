const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      unique: [true, "category existed"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
    },

    country: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
