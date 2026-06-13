const express = require("express");
const router = express.Router();

const supabase = require("../services/supabase");

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const { data, error } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false
      });

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      withdrawals: data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;