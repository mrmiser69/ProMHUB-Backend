const express = require("express");
const router = express.Router();

const supabase = require("../services/supabase");

/*
GET ALL WITHDRAWALS
*/
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("withdrawals")
      .select("*")
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

/*
APPROVE WITHDRAW
*/
router.post("/approve/:id", async (req, res) => {
  try {
    const withdrawId = req.params.id;

    const { data: withdraw } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawId)
      .single();

    if (!withdraw) {
      return res.status(404).json({
        success: false,
        error: "Withdraw not found"
      });
    }

    if (withdraw.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Withdrawal already processed"
      });
    }

    const { data, error } = await supabase
      .from("withdrawals")
      .update({
        status: "approved",
        processed_at: new Date()
      })
      .eq("id", withdrawId)
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

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

/*
REJECT WITHDRAW
*/
router.post("/reject/:id", async (req, res) => {
  try {
    const withdrawId = req.params.id;

    const { data: withdraw } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawId)
      .single();

    if (!withdraw) {
      return res.status(404).json({
        success: false,
        error: "Withdraw not found"
      });
    }

    if (withdraw.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Withdrawal already processed"
      });
    }

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", withdraw.user_id)
      .single();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    await supabase
      .from("users")
      .update({
        coin:
          (user.coin || 0) +
          (withdraw.amount || 0)
      })
      .eq("id", user.id);

    const { data, error } = await supabase
      .from("withdrawals")
      .update({
        status: "rejected",
        processed_at: new Date()
      })
      .eq("id", withdrawId)
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

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