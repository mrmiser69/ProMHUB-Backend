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
      photo_url,
    } = req.body;

    const { data, error } = await supabase
      .from("featured_tasks")
      .insert({
        title,
        telegram_link,
        reward,
        photo_url,
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

module.exports = router;