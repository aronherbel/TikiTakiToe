import Board from "./board";
import { SCORES } from "./constants";
import { switchPlayer } from "./utils";



export const minimax = (board: Board, player: number) : [number, number | null] => {
    const multiplier = SCORES[String(player)];
    let maxScore = -1;
    let bestMove = null;

    const winner = board.getWinner();
    if (winner !== null){
        return [SCORES[winner], null]
    } else {
        for(const square of board.getEmptySquare()){
            let copy: Board = board.clone();
            copy.makeMove(square, player);

            const thisScore = multiplier * minimax(copy, switchPlayer(player))[0];


            if (thisScore >= maxScore) {
                maxScore = thisScore;
                bestMove = square;
            }
        };
        return [multiplier * maxScore, bestMove];
    }
}