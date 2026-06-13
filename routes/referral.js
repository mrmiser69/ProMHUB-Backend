const express = require("express");
const router = express.Router();

const supabase = require("../services/supabase");

/*
GET REFERRAL INFO
*/
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.json({
      success: true,
      referral_code: user.referral_code,
      referrals: user.referrals || 0
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/*
CLAIM REFERRAL
*/
router.post("/claim", async (req, res) => {
  try {
    const {
      referrer_code,
      new_user_id
    } = req.body;

    const reward = 100;

    const { data: referrer } = await supabase
      .from("users")
      .select("*")
      .eq("referral_code", referrer_code)
      .single();

    if (!referrer) {
      return res.status(404).json({
        success: false,
        error: "Referral code not found"
      });
    }

    if (Number(referrer.id) === Number(new_user_id)) {
      return res.status(400).json({
        success: false,
        error: "Cannot refer yourself"
      });
    }

    const { data: existing } = await supabase
      .from("referrals")
      .select("*")
      .eq("referred_id", new_user_id);

    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Referral already claimed"
      });
    }

    await supabase
      .from("referrals")
      .insert({
        referrer_id: referrer.id,
        referred_id: new_user_id,
        reward
      });

    await supabase
      .from("users")
      .update({
        coin: (referrer.coin || 0) + reward,
        referrals: (referrer.referrals || 0) + 1,
        total_earned:
          (referrer.total_earned || 0) + reward
      })
      .eq("id", referrer.id);

    res.json({
      success: true,
      reward
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;