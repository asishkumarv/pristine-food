import mongoose from "mongoose";

const logoSchema = new mongoose.Schema(
  {
    public_id: String,
    url: String,
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "Pristine Organic Oils" },
    logo: { type: logoSchema, default: null },
    supportEmail: { type: String, default: "" },
    supportPhone: { type: String, default: "" },
    address: { type: String, default: "" },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
