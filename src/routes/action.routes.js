const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/action.controller");

router.post("/kick", ctrl.kick);
router.post("/disconnect", ctrl.disconnect);
router.post("/sendDM", ctrl.directMessage);


module.exports = router;
