const express = require("express");
const router = express.Router();

const axios = require("axios");
const supabase = require("../services/supabase");

/*
CLAIM FEATURED TASK REWARD
*/
router.post("/", async (req, res) => {
  try {
    const { user_id, task_id } = req.body;

    const { data: task, error: taskError } =
      await supabase
        .from("featured_tasks")
        .select("*")
        .eq("id", task_id)
        .single();

    if (taskError || !task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    const { data: existingClaim } =
      await supabase
        .from("user_task_claims")
        .select("*")
        .eq("user_id", user_id)
        .eq("task_id", task_id)
        .single();

    if (existingClaim?.claimed) {
      return res.status(400).json({
        success: false,
        error: "Already claimed",
      });
    }

    const username = task.telegram_link
      .replace("https://t.me/", "")
      .replace("http://t.me/", "")
      .replace("@", "")
      .split("/")[0];

    let memberStatus = "";

    try {
      const tgRes = await axios.get(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMember`,
        {
          params: {
            chat_id: `@${username}`,
            user_id,
          },
        }
      );

      memberStatus =
        tgRes.data?.result?.status || "";
    } catch (e) {
      return res.status(400).json({
        success: false,
        error:
          "Bot is not admin in channel/group",
      });
    }

    if (
      memberStatus !== "member" &&
      memberStatus !== "administrator" &&
      memberStatus !== "creator"
    ) {
      return res.status(400).json({
        success: false,
        error: "Join task first",
      });
    }

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", user_id)
      .single();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    await supabase
      .from("users")
      .update({
        coin:
          Number(user.coin || 0) +
          Number(task.reward || 0),
      })
      .eq("id", user_id);

    if (existingClaim) {
      await supabase
        .from("user_task_claims")
        .update({
          claimed: true,
        })
        .eq("id", existingClaim.id);
    } else {
      await supabase
        .from("user_task_claims")
        .insert({
          user_id,
          task_id,
          claimed: true,
        });
    }

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