const express = require("express");
const router = express.Router();

const supabase = require("../services/supabase");

router.post("/", async (req, res) => {
  try {
    const {
      user_id,
      method,
      wallet_address,
      amount
    } = req.body;

    const { data: user, error: userError } =
      await supabase
        .from("users")
        .select("*")
        .eq("id", user_id)
        .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if ((user.coin || 0) < amount) {
      return res.status(400).json({
        success: false,
        error: "Not enough coins"
      });
    }

    const { data, error } = await supabase
      .from("withdrawals")
      .insert({
        user_id,
        method,
        wallet_address,
        amount,
        status: "pending"
      })
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    await supabase
      .from("users")
      .update({
        coin: user.coin - amount
      })
      .eq("id", user_id);

    res.json({
      success: true,
      withdrawal: data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;