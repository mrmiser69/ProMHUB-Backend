const express = require("express");
const router = express.Router();

const axios = require("axios");

/*
VERIFY TASK JOIN
POST /verify-task
*/
router.post("/", async (req, res) => {
  try {
    const { user_id, telegram_link } = req.body;

    if (!user_id || !telegram_link) {
      return res.status(400).json({
        success: false,
        error: "user_id and telegram_link are required",
      });
    }

    const username = telegram_link
      .replace("https://t.me/", "")
      .replace("http://t.me/", "")
      .replace("@", "")
      .split("/")[0];

    const response = await axios.get(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMember`,
      {
        params: {
          chat_id: `@${username}`,
          user_id,
        },
      }
    );

    const status =
      response.data?.result?.status || "";

    const joined =
      status === "member" ||
      status === "administrator" ||
      status === "creator";

    return res.json({
      success: true,
      joined,
      status,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error:
        "Bot must be admin in channel/group",
    });
  }
});

module.exports = router;