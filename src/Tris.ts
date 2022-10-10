export interface TrisGamestate {
    moveCounter : number,
    grid : number[][]
}

export enum Result{
    WIN,
    DRAW,
    CONTINUE
}

export function InitTrisGamestate():TrisGamestate{
    return {
        moveCounter: 0, 
        grid : [
            [0,0,0],
            [0,0,0],
            [0,0,0]
        ]
    }
}

export function transpose(matrix: any[][]) : any[][]{
    return matrix[0].map((x: any, i:number) => matrix.map((x: any[]) => x[i]));
}

export function allEqual(array: Iterable<unknown>) : boolean{
    return (new Set(array)).size === 1;
}

export function isValidMove(game : TrisGamestate, row: number, col: number) : boolean
{
    if(row < 0 || row > 2 || col < 0 || col > 2){
        return false;
    }
    if(game.grid[row][col] !== 0){
        return false;
    }
    return true;
}

export function turn(game : TrisGamestate): 1 | 2 
{ 
    return (game.moveCounter % 2) == 0 ? 1 : 2 
}

export function playMove(game : TrisGamestate, rowNumber:number, colNumber:number) : [TrisGamestate, Result]{
    if(!isValidMove(game, rowNumber, colNumber)){
        return [game, Result.CONTINUE];
    }
    const s = turn(game);
    const grid = game.grid.map( 
        (row, rowIndex) => rowIndex === rowNumber ? 
            row.map(
                (cell, colIndex) => colIndex === colNumber ? s : cell
            )
        : row
    );
    
    //check if winning
    //check row
    if (allEqual(grid[rowNumber])) 
        return [{...game, grid: grid}, Result.WIN];

    //check column
    if (allEqual(transpose(grid)[colNumber])) 
        return [{...game, grid: grid}, Result.WIN];
    
    //check diagonal
    if(rowNumber === colNumber){
        const diagonal = grid.map((row, rowIndex) => 
            grid[rowIndex].filter((value, colIndex) => 
                rowIndex === colIndex
            )
        ).flat();

        if(allEqual(diagonal)){
            return [{...game, grid: grid}, Result.WIN];
        }
    }

    //check anti diagonal
    if(rowNumber + colNumber === 2){
        const antiDiagonal = grid.map((row, rowIndex) => 
            grid[rowIndex].filter((value, colIndex) => 
                rowIndex === 2 - colIndex
            )
        ).flat();
        if(allEqual(antiDiagonal)){
            return [{...game, grid: grid}, Result.WIN];
        }
    }

    if(game.moveCounter + 1 === 9){
        return [{...game, grid: grid}, Result.DRAW];
    }

    return [{moveCounter: game.moveCounter + 1, grid: grid}, Result.CONTINUE];
}