"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const express = require("express");
const path = require("path");
const socket_io_1 = require("socket.io");
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = new socket_io_1.Server(server);
var connectedSockets = [];
var confirmedSockets = [];
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join('public')));
app.get('/', (req, res) => {
    res.render("index");
});
server.listen(PORT, () => {
    console.log(`Listening on *:${PORT}`);
});
io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected`);
    connectedSockets.push(socket);
    socket.on('ready', (callback) => {
        if (confirmedSockets.length == 0) {
            confirmedSockets.push(socket);
            callback('X');
            console.log(`socket ${socket.id} is player X`);
        }
        else if (confirmedSockets.length == 1) {
            confirmedSockets.push(socket);
            callback('O');
            console.log(`socket ${socket.id} is player O`);
            startGame();
        }
    });
    socket.on("disconnect", (reason) => {
        console.log(`user ${socket.id} disconnected for: ${reason}`);
        connectedSockets = connectedSockets.filter((v, _) => v.id != socket.id);
        confirmedSockets = confirmedSockets.filter((v, _) => v.id != socket.id);
    });
});
function startGame() {
    var turn = 0;
    var grid = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    confirmedSockets.forEach(socket => {
        socket.on('play', (move) => {
            if (confirmedSockets[turn].id != socket.id) {
                return;
            }
            const { row, col } = move;
            if (grid[row][col] != 0) {
                return;
            }
            grid[row][col] = turn + 1;
            confirmedSockets.forEach(socket => {
                socket.emit('updateState', { grid: grid });
            });
            turn = (turn + 1) % 2;
        });
    });
}
