"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playMove = exports.turn = exports.isValidMove = exports.allEqual = exports.transpose = exports.InitTrisGamestate = exports.Result = void 0;
var Result;
(function (Result) {
    Result[Result["WIN"] = 0] = "WIN";
    Result[Result["DRAW"] = 1] = "DRAW";
    Result[Result["CONTINUE"] = 2] = "CONTINUE";
})(Result = exports.Result || (exports.Result = {}));
function InitTrisGamestate() {
    return {
        moveCounter: 0,
        grid: [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ]
    };
}
exports.InitTrisGamestate = InitTrisGamestate;
function transpose(matrix) {
    return matrix[0].map((x, i) => matrix.map((x) => x[i]));
}
exports.transpose = transpose;
function allEqual(array) {
    return (new Set(array)).size === 1;
}
exports.allEqual = allEqual;
function isValidMove(game, row, col) {
    if (row < 0 || row > 2 || col < 0 || col > 2) {
        return false;
    }
    if (game.grid[row][col] !== 0) {
        return false;
    }
    return true;
}
exports.isValidMove = isValidMove;
function turn(game) {
    return (game.moveCounter % 2) == 0 ? 1 : 2;
}
exports.turn = turn;
function playMove(game, rowNumber, colNumber) {
    if (!isValidMove(game, rowNumber, colNumber)) {
        return [game, Result.CONTINUE];
    }
    const s = turn(game);
    const grid = game.grid.map((row, rowIndex) => rowIndex === rowNumber ?
        row.map((cell, colIndex) => colIndex === colNumber ? s : cell)
        : row);
    //check if winning
    //check row
    if (allEqual(grid[rowNumber]))
        return [Object.assign(Object.assign({}, game), { grid: grid }), Result.WIN];
    //check column
    if (allEqual(transpose(grid)[colNumber]))
        return [Object.assign(Object.assign({}, game), { grid: grid }), Result.WIN];
    //check diagonal
    if (rowNumber === colNumber) {
        const diagonal = grid.map((row, rowIndex) => grid[rowIndex].filter((value, colIndex) => rowIndex === colIndex)).flat();
        if (allEqual(diagonal)) {
            return [Object.assign(Object.assign({}, game), { grid: grid }), Result.WIN];
        }
    }
    //check anti diagonal
    if (rowNumber + colNumber === 2) {
        const antiDiagonal = grid.map((row, rowIndex) => grid[rowIndex].filter((value, colIndex) => rowIndex === 2 - colIndex)).flat();
        if (allEqual(antiDiagonal)) {
            return [Object.assign(Object.assign({}, game), { grid: grid }), Result.WIN];
        }
    }
    if (game.moveCounter + 1 === 9) {
        return [Object.assign(Object.assign({}, game), { grid: grid }), Result.DRAW];
    }
    return [{ moveCounter: game.moveCounter + 1, grid: grid }, Result.CONTINUE];
}
exports.playMove = playMove;
