import http = require("http");
import express = require("express");
import path = require("path");
import { Server } from "socket.io";
import { isShorthandPropertyAssignment } from "typescript";

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

var connectedSockets = [];
var confirmedSockets = [];

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.set("view engine", "ejs");
app.use(express.static(path.join('public')));

app.get('/', (req, res) =>{
    res.render("index");
});

server.listen(PORT, ()=>{
    console.log(`Listening on *:${PORT}`);
});

io.on('connection', (socket) =>{
    console.log(`user ${socket.id} connected`);
    connectedSockets.push(socket);
    socket.on('ready', (callback)=>{
        if(confirmedSockets.length == 0){
            confirmedSockets.push(socket);
            callback('X');
            console.log(`socket ${socket.id} is player X`);
        }
        else if(confirmedSockets.length == 1){
            confirmedSockets.push(socket);
            callback('O');
            console.log(`socket ${socket.id} is player O`);
            
            startGame();
        }
    })
    socket.on("disconnect", (reason)=>{
        console.log(`user ${socket.id} disconnected for: ${reason}`);
        connectedSockets = connectedSockets.filter((v, _)=>v.id != socket.id);
        confirmedSockets = confirmedSockets.filter((v, _)=>v.id != socket.id);
    });
})

function startGame(){
    var turn = 0;
    var grid = [
        [0,0,0],
        [0,0,0],
        [0,0,0]
    ]

    confirmedSockets.forEach(socket => {
        socket.on('play', (move: { row: number; col: number; })=>{
            if(confirmedSockets[turn].id != socket.id){
                return;
            }
            const {row, col} = move;
            if(grid[row][col] != 0){
                return;
            }

            grid[row][col] = turn + 1;
            confirmedSockets.forEach(socket => {
                socket.emit('updateState', {grid: grid})
            });
            turn = (turn + 1) % 2;
        })
    });
}
