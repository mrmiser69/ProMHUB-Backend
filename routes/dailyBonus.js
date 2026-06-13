const express = require("express");
const router = express.Router();

const supabase = require("../services/supabase");

const BONUS_AMOUNT = 50;

router.post("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("coin,last_daily_bonus")
      .eq("id", userId)
      .single();

    if (userError) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (user.last_daily_bonus) {
      const lastClaim = new Date(user.last_daily_bonus);
      const now = new Date();

      const diffHours =
        (now - lastClaim) / (1000 * 60 * 60);

      if (diffHours < 24) {
        return res.json({
          success: false,
          error: "Daily bonus already claimed",
          hoursLeft: (24 - diffHours).toFixed(1)
        });
      }
    }

    const newCoin = (user.coin || 0) + BONUS_AMOUNT;

    const { error: updateError } = await supabase
      .from("users")
      .update({
        coin: newCoin,
        last_daily_bonus: new Date().toISOString()
      })
      .eq("id", userId);

    if (updateError) {
      return res.status(500).json({
        success: false,
        error: updateError.message
      });
    }

    res.json({
      success: true,
      reward: BONUS_AMOUNT,
      coin: newCoin
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;