import mongoose from "mongoose";

const pointSystemSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 例如 "標準轉換" 或 "雙倍點數日"
  minAmount: { type: Number, required: true }, // 最低消費金額
  formula: { type: String, required: true }, // 儲存公式，如 "floor(x/300)"
  desciption: { type: String }, // 描述
  active: { type: Boolean, default: false }, // 是否啟用
});

export default mongoose.model("PointSystem", pointSystemSchema);

