import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  eventTitle: { type: String, default: "Elevate 2026" },
  eventTagline: { type: String, default: "Upgrade Your Skills, Elevate Your Future" },
  eventMode: { type: String, default: "Online Webinar Series" },
  qrCodeFull: { type: String, default: "" }, // Base64 or local server path to QR image
  qrCodeCustom: { type: String, default: "" }, // Base64 or local server path to QR image
  qrCode1: { type: String, default: "" },
  qrCode2: { type: String, default: "" },
  qrCode3: { type: String, default: "" },
  qrCode4: { type: String, default: "" },
  qrCode5: { type: String, default: "" },
  qrCode6: { type: String, default: "" },
  upiId: { type: String, default: "sknieee@upi" },
  priceFull: { type: Number, default: 150 },
  priceCustom: { type: Number, default: 40 }
}, {
  timestamps: true
});

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
export default SystemSettings;
