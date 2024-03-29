const express = require("express");
const bugcatch = require("@bug-catch/server");
const cors = require("cors");
const routes = require("./routes");
const pkg = require("../../package.json");

const server = express();

server.use(cors());
server.use(express.json());

server.use("/", routes);

// Base root welcome message
server.get("/", (req, res) => {
    res.send({
        message: "Hello, world!",
        version: pkg.version,
        routes: [
            "/tracks",
            "/tracks/:id",
            "/tracks/:id/cover",
            "/tracks/:id/audio",
            "/albums",
        ],
    });
});

//  Applly bugcatch as middleware
if (
    process.env.REACT_APP_BUGCATCH_ENABLE &&
    process.env.BUGCATCH_TOKEN &&
    process.env.BUGCATCH_MONGO_URI &&
    process.env.BUGCATCH_MONGO_URI.length > 5
) {
    server.use(
        "/bugcatch",
        bugcatch({
            api: {
                token: process.env.BUGCATCH_TOKEN, // Token required for viewing collected data
                rateLimit: {
                    // Rate limiter to reduce spam
                    // Default value is 15 requests every 1 hour (per user)
                    windowMs: 60 * 60 * 1000, // 60 minutes
                    max: 20,
                },
            },
            mongodb: {
                uri: process.env.BUGCATCH_MONGO_URI,
                database: "music-library",
            },
        })
    );
}

// Fallback server error message
server.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({
        message: "somthing went wrong",
        success: false,
    });
});

module.exports = server;
