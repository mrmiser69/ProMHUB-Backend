const express = require("express");
const router = express.Router();

const supabase = require("../services/supabase");

router.post("/", async (req, res) => {
  try {
    const { user_id, promotion_id } = req.body;

    const { data: existing } = await supabase
      .from("task_completions")
      .select("*")
      .eq("user_id", user_id)
      .eq("promotion_id", promotion_id);

    if (existing && existing.length > 0) {
      return res.json({
        success: false,
        error: "Reward already claimed"
      });
    }

    const { data: promotion, error: promoError } =
      await supabase
        .from("promotions")
        .select("*")
        .eq("id", promotion_id)
        .single();

    if (promoError || !promotion) {
      return res.status(404).json({
        success: false,
        error: "Promotion not found"
      });
    }

    // Block own promotion claim
    if (promotion.owner_id === user_id) {
      return res.status(400).json({
        success: false,
        error: "You cannot claim your own promotion"
      });
    }

    // Promotion inactive
    if (!promotion.active) {
      return res.status(400).json({
        success: false,
        error: "Task closed"
      });
    }

    // Slot limit check
    if (
      (promotion.completed_slots || 0) >=
      (promotion.total_slots || 0)
    ) {
      return res.status(400).json({
        success: false,
        error: "Task completed"
      });
    }

    const reward = promotion.reward;

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

    const newCoin =
      (user.coin || 0) + reward;

    await supabase
      .from("users")
      .update({
        coin: newCoin,
        total_earned:
          (user.total_earned || 0) + reward,
        joined_tasks:
          (user.joined_tasks || 0) + 1
      })
      .eq("id", user_id);

    await supabase
      .from("task_completions")
      .insert({
        user_id,
        promotion_id,
        reward
      });

    const newCompleted =
      (promotion.completed_slots || 0) + 1;

    await supabase
      .from("promotions")
      .update({
        completed_slots: newCompleted,
        active:
          newCompleted <
          (promotion.total_slots || 0)
      })
      .eq("id", promotion_id);

    res.json({
      success: true,
      reward,
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