import { createServer } from "http";
import { Server, Socket } from "socket.io";
import express from "express";
import { HEALTHY, PORT } from "./constants";
import { FakeTodoDb } from "./db/todoDB";

const app = express();

app.get("/", (req, res) => res.status(200).send(`<h1>${HEALTHY}</h1>`));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
});

const FakeDb = new FakeTodoDb();

const FAKE_ROOM = "some fake room";

io.on("connection", (socket: Socket) => {
  const { id } = socket;
  console.log("new client", id, socket.handshake.auth.user.username);

  // assume authenticated to some room
  socket.join(FAKE_ROOM);
  setClients();

  socket.on("get-data", () => broadcastData(id));

  // comments stuff
  socket.on("add-comment", (comment) => {
    const res = FakeDb.comment(comment);
    if (res.success) broadcastData(FAKE_ROOM);
  });
  socket.on("edit-comment", (comment) => {
    const res = FakeDb.updateComment(comment, comment.id);
    if (res.success) broadcastData(FAKE_ROOM);
  });
  socket.on("delete-comment", (comment) => {
    const res = FakeDb.deleteComment(comment.id);
    if (res.success) broadcastData(FAKE_ROOM);
  });

  // replies stuff
  socket.on("add-reply", (reply) => {
    const res = FakeDb.reply(reply);
    if (res.success) broadcastData(FAKE_ROOM);
  });
  socket.on("edit-reply", (reply) => {
    const res = FakeDb.updateReply(reply, reply.id);
    if (res.success) broadcastData(FAKE_ROOM);
  });
  socket.on("delete-reply", (reply) => {
    const res = FakeDb.deleteReply(reply.id);
    if (res.success) broadcastData(FAKE_ROOM);
  });

  socket.on("disconnect", (reason) => {
    console.log("disconnecting client", id, reason);
    setClients();
  });
});

const setClients = () => {
  const clients = io.sockets.adapter.rooms.get(FAKE_ROOM);
  let clientList: string[] = [];
  clients?.forEach((clientId) => {
    clientList.push(
      io.sockets.sockets.get(clientId)?.handshake.auth.user.username
    );
  });
  io.to(FAKE_ROOM).emit("client-list", clientList);
};

const broadcastData = (room: string) =>
  io.to(room).emit("data", FakeDb.select());

httpServer.listen(PORT, () => console.log(HEALTHY));
