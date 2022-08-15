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

enum Result{
    WIN,
    DRAW,
    CONTINUE
}

class Game{
    //either 0 or 1
    
    moveCount : number;      
    grid : number[][];

    constructor(){
        this.moveCount = 0;
        this.grid = [
            [0,0,0],
            [0,0,0],
            [0,0,0]
        ]
    }

    isValidMove(row:number, col:number):boolean{
        if(row < 0 || row > 2 || col < 0 || col > 2){
            return false;
        }
        if(this.grid[row][col] !== 0){
            return false;
        }
        return true;
    }
    /**
     * 
     * @returns 1 or 2
     */
    turn() { return (this.moveCount % 2) + 1}

    /**
     * 
     * @param row row of the move
     * @param col column of the move
     * @returns true if the move is winning, false otherwise. 
     * If this function returns true you can get the winner with this.turn;
     */
    playMove(row:number, col:number):Result{
        const s = this.turn();
        this.grid[row][col] = s;
        
        //check if winning
        //check column
        for(let i = 0; i < 3; ++i){
            if(this.grid[row][i] !== s){
                break;
            }
            if(i == 2){
                return Result.WIN;
            }
        }

        for(let i = 0; i < 3; ++i){
            if(this.grid[i][col] !== s){
                break;
            }
            if(i == 2){
                return Result.WIN;
            }
        }

        //check diagonal
        if(row === col){
            //inside primary diagonal
            for(let i = 0; i < 3; ++i){
                if(this.grid[i][i] !== s){
                    break;
                }
                if(i == 2){
                    return Result.WIN;
                }
            }
        }

        if(row + col === 2){
            //inside anti diagonal
            for(let i = 0; i < 3; ++i){
                if(this.grid[i][2 - i] !== s){
                    break;
                }
                if(i == 2){
                    return Result.WIN;
                }
            }
        }

        if(this.moveCount + 1 == 9){
            return Result.DRAW;
        }

        this.moveCount++;
        return Result.CONTINUE;
    }
}

function startGame(){
    const game = new Game;
    console.log(`${confirmedSockets.map(socket => socket.id)}`);
    confirmedSockets.forEach(socket => {
        socket.on('play', (move: { row: number; col: number; })=>{
            console.log(`[${socket.id}] move`);
            console.log(`[ ${game.grid} ], [${game.turn()}]`)
            if(confirmedSockets[game.turn() - 1].id != socket.id){
                console.log(`not your turn`);
                return;
            }
            const {row, col} = move;
            console.log(`[${row}, ${col}]`);
            if( !game.isValidMove(row, col) ){
                console.log('move not valid');
                return;
            } 
            const result : Result = game.playMove(row, col);
            confirmedSockets.forEach(socket => {
                socket.emit('updateState', {grid: game.grid});
            });

            if(result === Result.DRAW){
                confirmedSockets.forEach(socket =>{
                    socket.emit('result', 'Draw!');
                    socket.removeAllListeners('play');
                })
            }
            if(result === Result.WIN){
                confirmedSockets.forEach(socket =>{
                    if(socket.id === confirmedSockets[game.turn() - 1].id){
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