const express = require("express");
const router = express.Router();

const axios = require("axios");
const supabase = require("../services/supabase");

/*
CHECK TASK STATUS
GET /task-status/:userId/:taskId
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

    return res.json({
      success: true,
      joined: !!data,
      claimed: data?.claimed || false,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/*
MARK USER JOINED TASK
POST /task-status/join
*/
router.post("/join", async (req, res) => {
  try {
    const { user_id, task_id } = req.body;

    if (!user_id || !task_id) {
      return res.status(400).json({
        success: false,
        error: "user_id and task_id are required",
      });
    }

    const { data: existing, error: findError } =
      await supabase
        .from("user_task_claims")
        .select("*")
        .eq("user_id", user_id)
        .eq("task_id", task_id)
        .maybeSingle();

    if (findError) {
      return res.status(500).json({
        success: false,
        error: findError.message,
      });
    }

    if (!existing) {
      const { error: insertError } =
        await supabase
          .from("user_task_claims")
          .insert({
            user_id,
            task_id,
            claimed: false,
          });

      if (insertError) {
        return res.status(500).json({
          success: false,
          error: insertError.message,
        });
      }
    }

    return res.json({
      success: true,
      joined: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/*
VERIFY USER JOINED CHANNEL
POST /task-status/verify
*/
router.post("/verify", async (req, res) => {
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

    const username = task.telegram_link
      .replace("https://t.me/", "")
      .replace("http://t.me/", "")
      .replace("@", "")
      .split("/")[0];

    const tgRes = await axios.get(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMember`,
      {
        params: {
          chat_id: `@${username}`,
          user_id,
        },
      }
    );

    const status =
      tgRes.data?.result?.status || "";

    if (
      status !== "member" &&
      status !== "administrator" &&
      status !== "creator"
    ) {
      return res.status(400).json({
        success: false,
        error: "Please join channel first",
      });
    }

    return res.json({
      success: true,
      verified: true,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: "Please join channel first",
    });
  }
});

module.exports = router;