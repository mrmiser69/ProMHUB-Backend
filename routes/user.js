const express = require("express");
const router = express.Router();

const supabase = require("../services/supabase");

router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      user: [data]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;