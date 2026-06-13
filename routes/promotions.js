const express = require("express");
const router = express.Router();

const supabase = require("../services/supabase");

/*
GET ALL PROMOTIONS
*/
router.get("/", async (req, res) => {
  try {
    const userId = req.query.user_id;

    let query = supabase
      .from("promotions")
      .select("*")
      .eq("active", true)
      .order("created_at", {
        ascending: false
      });

    // Don't show own promotions
    if (userId) {
      query = query.neq(
        "owner_id",
        userId
      );
    }

    const { data, error } =
      await query;

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      promotions: data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/*
CREATE PROMOTION
*/
router.post("/", async (req, res) => {
  try {
    const {
      owner_id,
      title,
      target_link,
      reward,
      total_slots,
      description
    } = req.body;

    const totalCost =
      Number(reward) *
      Number(total_slots);

    // Get user
    const {
      data: user,
      error: userError
    } = await supabase
      .from("users")
      .select("*")
      .eq("id", owner_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Check balance
    if (
      (user.coin || 0) <
      totalCost
    ) {
      return res.status(400).json({
        success: false,
        error: "Insufficient balance"
      });
    }

    // Create promotion
    const {
      data,
      error
    } = await supabase
      .from("promotions")
      .insert({
        owner_id,
        type: "telegram",
        title,
        target_link,
        reward,
        total_slots,
        completed_slots: 0,
        active: true,
        featured: false,
        description,
        verified: false
      })
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Deduct coins
    await supabase
      .from("users")
      .update({
        coin:
          (user.coin || 0) -
          totalCost,

        total_spent:
          (user.total_spent || 0) +
          totalCost,

        promoted_tasks:
          (user.promoted_tasks || 0) +
          1
      })
      .eq("id", owner_id);

    res.json({
      success: true,
      promotion: data,
      cost: totalCost,
      remaining_coin:
        (user.coin || 0) -
        totalCost
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;