const express = require("express");
const actions = require("./routes/action.routes");

function createApp() {
    const app = express();
    app.use(express.json());

    app.get("/health", (_req, res) => res.json({ ok: true, service: "discord-actions" }));

    app.use("/actions", actions);

    // basit hata yakalayıcı
    app.use((err, _req, res, _next) => {
        console.error("Unhandled error:", err);
        res.status(500).json({ ok: false, error: "Internal Server Error" });
    });

    return app;
}

module.exports = { createApp };
