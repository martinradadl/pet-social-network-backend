import bodyParser from "body-parser";
import express from "express";
import http from "http";
// import { initMongo } from "./mongo-setup";
import cors from "cors";
import { APP_URL } from "./helpers/global";
import cookieParser from "cookie-parser";
import auth from "./routes/auth";
import chats from "./routes/chat";
import comments from "./routes/comment";
import directMessages from "./routes/direct-message";
import follows from "./routes/follow";
import likedComments from "./routes/liked-comment";
import likedPosts from "./routes/liked-post";
import posts from "./routes/post";
import savedPosts from "./routes/saved-post";
import sharedPosts from "./routes/shared-post";
import stories from "./routes/story";

const jsonParser = bodyParser.json();

const app = express();
const httpServer = http.createServer(app);
const port = /*process.env.PORT ||*/ 3000;

// initMongo().catch(console.dir);

app.use(jsonParser);
app.use(cors({ origin: APP_URL })); // APP_URL pending
app.use(cookieParser());
app.use(express.static("public"));
// @ts-expect-error error pending
app.get("/", (_, res) => res.send("Server is running"));
app.use("/uploads", express.static("uploads"));

app.use("/auth", auth);
app.use("/chats", chats);
app.use("/comments", comments);
app.use("/directMessages", directMessages);
app.use("/follows", follows);
app.use("/likedComments", likedComments);
app.use("/likedPosts", likedPosts);
app.use("/posts", posts);
app.use("/savedPosts", savedPosts);
app.use("/sharedPosts", sharedPosts);
app.use("/stories", stories);

// Start the server and listen on the specified port
httpServer.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port}`);
});

export const shutdownServer = (callback: (error?: Error) => void) =>
  httpServer && httpServer.close(callback);

module.exports = app;
