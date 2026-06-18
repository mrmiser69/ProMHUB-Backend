const express = require("express");
const router = express.Router();

const supabase = require("../services/supabase");

/*
GET ALL FEATURED TASKS
*/
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("featured_tasks")
      .select("*")
      .eq("is_active", true)
      .order("id", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      tasks: data,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/*
CREATE FEATURED TASK
*/
router.post("/", async (req, res) => {
  try {
    const {
      title,
      telegram_link,
      reward,
    } = req.body;

    let photo_url = "";

    try {
      const username = telegram_link
        .replace("https://t.me/", "")
        .replace("http://t.me/", "")
        .replace("@", "")
        .split("/")[0];

      photo_url =
        `https://unavatar.io/telegram/${username}`;
    } catch {
      photo_url =
        "https://placehold.co/200x200";
    }

    const { data, error } = await supabase
      .from("featured_tasks")
      .insert({
        title,
        telegram_link,
        reward,
        photo_url,
        is_active: true,
      })
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      task: data,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/*
DELETE TASK
*/
router.delete("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;

    const { error } = await supabase
      .from("featured_tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
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

/*
TOGGLE ACTIVE / INACTIVE
*/
router.put("/:id/toggle", async (req, res) => {
  try {
    const taskId = req.params.id;

    const { data: task } = await supabase
      .from("featured_tasks")
      .select("is_active")
      .eq("id", taskId)
      .single();

    const { data, error } = await supabase
      .from("featured_tasks")
      .update({
        is_active: !task.is_active,
      })
      .eq("id", taskId)
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      task: data,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;