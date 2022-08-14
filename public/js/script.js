const socket = io();
const WIDTH = 400;
const HEIGHT = 400;

window.onload = () => {
    const cvs = document.getElementById("game-canvas");
    const ctx = cvs.getContext("2d");
    let mysign = null; //either drawX or drawO
    var grid = [
        [0,0,0],
        [0,0,0],
        [0,0,0]
    ];
    drawGrid(ctx, grid);

    cvs.addEventListener("mousedown", (event)=>{
        const {x,y} = getMousePosition(cvs, event);
        const {row, col} = xyTorowcol(x, y);
        
        console.log(`row: ${row}, col:${col}`);
        
        socket.emit('play', {row, col})
    });

    socket.on('updateState', (state)=>{
        grid = state.grid;
        drawGrid(ctx, grid);
    })

    socket.emit('ready', (sign)=>{
        switch(sign){
            case 'X':
                mysign = drawX;
                break;
            case 'O':
                mysign = drawO;
        }
    })
}

function tdClicked(row, col){
    console.log(row, col);
}

function drawGrid(ctx, grid){
    drawLine(ctx, WIDTH / 3, 0, WIDTH / 3, HEIGHT);
    drawLine(ctx, WIDTH * 2/3, 0, WIDTH * 2/3, HEIGHT);
    drawLine(ctx, 0, HEIGHT / 3, WIDTH, HEIGHT / 3);
    drawLine(ctx, 0, HEIGHT *2/3, WIDTH, HEIGHT *2/3);

    for(var i = 0; i < 3; ++i){
        for(var j = 0; j < 3; ++j){
            switch(grid[i][j]){
                case 1:
                    drawX(ctx, i, j);
                    break;
                case 2:
                    drawO(ctx, i, j);
                    break;
            }
        }
    }
}

function drawLine(ctx, x1,y1, x2,y2){
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}

function drawCircle(ctx, x, y, r){
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2*Math.PI);
    ctx.stroke();
}

function getMousePosition(canvas, event){
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return {x, y};
}

function rowcolToxy(row, col){
    return {x: WIDTH/(3*2) + (col * WIDTH/3), y:HEIGHT/(3*2) + (row * HEIGHT/3)};
}

//x,y are the center of the X
function drawX(ctx, row, col){
    const size = 60;
    const {x, y} = rowcolToxy(row, col);
    drawLine(ctx, x-size/2, y+size/2, x+size/2, y-size/2)
    drawLine(ctx, x-size/2, y-size/2, x+size/2, y+size/2)
}

function drawO(ctx, row, col){
    const radius = 30;
    const {x, y} = rowcolToxy(row, col);
    drawCircle(ctx, x,y, radius);
}

function xyTorowcol(x, y){
    let row = Math.floor(y/(HEIGHT/3)) 
    let col = Math.floor(x/(WIDTH/3))

    if(row < 0) row = 0;
    if(row > 2) row = 2;
    if(col < 0) col = 0;
    if(col > 2) col = 2;

    return {row, col};
}