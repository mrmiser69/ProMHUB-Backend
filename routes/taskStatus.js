const express = require("express");
const router = express.Router();

const supabase = require("../services/supabase");

/*
CHECK TASK STATUS
*/
router.get("/:userId/:taskId", async (req, res) => {
  try {
    const { userId, taskId } = req.params;

    const { data, error } = await supabase
      .from("user_task_claims")
      .select("*")
      .eq("user_id", userId)
      .eq("task_id", taskId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      claimed: data?.claimed || false,
      joined: !!data,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/*
MARK USER JOINED TASK
*/
router.post("/join", async (req, res) => {
  try {
    const { user_id, task_id } = req.body;

    const { data: existing } = await supabase
      .from("user_task_claims")
      .select("*")
      .eq("user_id", user_id)
      .eq("task_id", task_id)
      .maybeSingle();

    if (!existing) {
      await supabase
        .from("user_task_claims")
        .insert({
          user_id,
          task_id,
          claimed: false,
        });
    }

    res.json({
      success: true,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;