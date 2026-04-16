import express from "express";
const router = express.Router();
router.use(express.json());

import loginController from "../controllers/loginController.js";

// /login/
router.post("/", async (req, res) => {
  const message = await loginController(req.body.username, req.body.password);
  if (message.token) {
    res.cookie("token", message.token, {
      httpOnly: true,
      sameSite: "lax", 
      secure: false, // true in production (https)
      // maxAge: 24 * 60 * 60 * 1000, // if no maxage then cookie expires when browser closed
    });
  }

  res.sendStatus(message.code)
});

export default router;
