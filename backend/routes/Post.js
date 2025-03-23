const express = require("express")
const router = express.Router();
const {Post} = require("../models")

router.get("/", (req, res) => {
    res.json("Hellllo")
})

router.post("/", async (req,res) => {
    const post = req.body;
    await Post.create(post)
    res.json(post);
})

module.exports = router