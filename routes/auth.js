const express = require("express");
const router = express.Router();

const supabase = require("../services/supabase");

router.post("/", async (req, res) => {
  try {
    const { id, username, first_name } = req.body;

    const { data, error } = await supabase
      .from("users")
      .upsert({
        id,
        username,
        first_name
      })
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      user: data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;