import http = require("http");
import express = require("express");
import path = require("path");
import { Server } from "socket.io";
import Tris = require("./Tris");

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

            startGame(confirmedSockets.map(v => v));
            confirmedSockets = [];
        }
    })
    socket.on("disconnect", (reason)=>{
        console.log(`user ${socket.id} disconnected for: ${reason}`);
        connectedSockets = connectedSockets.filter((v, _)=>v.id != socket.id);
        confirmedSockets = confirmedSockets.filter((v, _)=>v.id != socket.id);
    });
})


function startGame(players){
    let game = Tris.InitTrisGamestate();
    console.log(`${players.map(socket => socket.id)}`);
    players.forEach(socket => {
        socket.on('play', (move: { row: number; col: number; })=>{
            console.log(`[ ${socket.id} ] move`);
            console.log(`[ ${game.grid} ], [${Tris.turn(game)}]`)
            if(players[Tris.turn(game) - 1].id != socket.id){
                console.log(`not your turn`);
                return;
            }
            const {row, col} = move;
            console.log(`[ ${row}, ${col} ]`);
            if( !Tris.isValidMove(game, row, col) ){
                console.log('move not valid');
                return;
            } 
            const [newGame, result] = Tris.playMove(game, row, col);
            game = newGame; //side effect
            players.forEach(socket => {
                socket.emit('updateState', {grid: game.grid});
            });

            if(result === Tris.Result.DRAW){
                players.forEach(socket =>{
                    socket.emit('result', 'Draw!');
                    socket.removeAllListeners('play');
                })
            }
            if(result === Tris.Result.WIN){
                players.forEach(socket =>{
                    if(socket.id === players[Tris.turn(game) - 1].id){
                        socket.emit('result', 'You Win!');
                    }else{
                        socket.emit('result', 'You Lose.');
                    }
                    socket.removeAllListeners('play');
                })
            }
        })
    });
}