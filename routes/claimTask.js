const express = require("express");
const router = express.Router();

const supabase = require("../services/supabase");

/*
CLAIM FEATURED TASK REWARD
*/
router.post("/", async (req, res) => {
  try {
    const { user_id, task_id } = req.body;

    const { data: task } = await supabase
      .from("featured_tasks")
      .select("*")
      .eq("id", task_id)
      .single();

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    const { data: claim } = await supabase
      .from("user_task_claims")
      .select("*")
      .eq("user_id", user_id)
      .eq("task_id", task_id)
      .single();

    if (!claim) {
      return res.status(400).json({
        success: false,
        error: "Join task first",
      });
    }

    if (claim.claimed) {
      return res.status(400).json({
        success: false,
        error: "Already claimed",
      });
    }

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", user_id)
      .single();

    await supabase
      .from("users")
      .update({
        coin: (user.coin || 0) + task.reward,
      })
      .eq("id", user_id);

    await supabase
      .from("user_task_claims")
      .update({
        claimed: true,
      })
      .eq("id", claim.id);

    res.json({
      success: true,
      reward: task.reward,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;