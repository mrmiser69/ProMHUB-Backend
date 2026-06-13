require("dotenv").config();

const express = require("express");
const cors = require("cors");

const userRoute = require("./routes/user");
const healthRoute = require("./routes/health");
const authRoute = require("./routes/auth");
const dailyBonusRoute = require("./routes/dailyBonus");
const promotionsRoute = require("./routes/promotions");
const claimRewardRoute = require("./routes/claimReward");
const withdrawRoute = require("./routes/withdraw");
const withdrawHistoryRoute = require("./routes/withdrawHistory");
const adminWithdrawRoute = require("./routes/adminWithdraw");
const referralRoute = require("./routes/referral");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRoute);
app.use("/user", userRoute);
app.use("/auth", authRoute);
app.use("/daily-bonus", dailyBonusRoute);
app.use("/promotions", promotionsRoute);
app.use("/claim-reward", claimRewardRoute);
app.use("/withdraw", withdrawRoute);
app.use("/withdraw-history", withdrawHistoryRoute);
app.use("/admin/withdrawals", adminWithdrawRoute);
app.use("/referral", referralRoute);

app.listen(process.env.PORT, () => {
  console.log(
    `PromoHub Backend Running On Port ${process.env.PORT}`
  );
});