import React, {useCallback, useEffect, useState} from "react";
import styled from "styled-components";
import { DIMENSIONS, PLAYER_X, PLAYER_O, SQUARE_DIMS, GAME_STATES, DRAW } from "./constants";
import { getRandomInt, switchPlayer } from "./utils";
import Board from "./board";
import { minimax } from "./minimax";
import { GAME_MODES } from "./constants";
import { ResultModal } from "./resultModal";
import { border } from "./styles";

const board = new Board();
const arr = new Array(DIMENSIONS ** 2).fill(null);

interface Props {
  squares?: Array<number | null>;
}

export const TikiTakiToki = ({squares = arr }: Props) => {

    const [grid, setGrid] = useState(arr);
   
    const [winner, setWinner] = useState<null | string>(null);

    const [nextMove, setNextMove] = useState<null|number>(null);

    const [players, setPlayers] = useState<Record<string, number | null>>({
        human: null,
        ai: null,
    });

    const [modalOpen, setModalOpen] = useState(false);

    const [mode, setMode] = useState(GAME_MODES.medium)
    
    const [gameState, setGameState] = useState(GAME_STATES.notStarted);


    useEffect(() => {
      const boardWinner = board.getWinner(grid);
  
      const declareWinner = (winner: number) => {
        let winnerStr = "";
        switch (winner) {
          case PLAYER_X:
            winnerStr = "Player X wins!";
            break;
          case PLAYER_O:
            winnerStr = "Player O wins!"
            break;
          case DRAW:
          default:
            winnerStr = "It's a draw"
          }
          setGameState(GAME_STATES.over);
          setWinner(winnerStr);
  
          setTimeout(() => setModalOpen(true), 300);
      };

      if (boardWinner !== null && gameState !== GAME_STATES.over){
        declareWinner(boardWinner);
      }
    }, [gameState, grid, nextMove]);
   

    const move = useCallback(
      (index: number, player: number | null) => {
      if(player && gameState === GAME_STATES.inProgess){
          setGrid((grid) => {
              const gridCopy = grid.concat();
              gridCopy[index] = player;
              return gridCopy;
          });
      }
    }, 
    [gameState]
  );

    const aiMove = useCallback(() => {
      const board = new Board(grid.concat());
      const emptyIndices = board.getEmptySquare(grid);

      let index: any;

      switch (mode){
        //EasyMode
        case GAME_MODES.easy:
          do{
            index = getRandomInt(0, 8)
          } while (!emptyIndices.includes(index));
          break;
        //Medium Mode
        case GAME_MODES.medium:
          const smartMove = !board.isEmpty(grid) && Math.random() < 0.5;
          if(smartMove){
            index = minimax(board, players.ai!)[1];
          } else{
            do{
              index = getRandomInt(0, 8)
            } while (!emptyIndices.includes(index));
          }
          break;
         //Difficult Mode
        case GAME_MODES.difficult:
          default:
             index = board.isEmpty(grid)
            ? getRandomInt(0, 8)
            : minimax(board, players.ai!)[1];
      }

      if (index !== null && !grid[index]) {
        if(players.ai !== null) {
         move(index, players.ai);
        }
        setNextMove(players.human);
       }
      }, [move, grid, players, mode]);


      useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (
          nextMove !== null &&
          nextMove === players.ai &&
          gameState !== GAME_STATES.over
        ) {
          // Delay AI moves to make them more natural
          timeout = setTimeout(() => {
            aiMove();
          }, 500);
        }
        return () => timeout && clearTimeout(timeout);
      }, [nextMove, aiMove, players.ai, gameState]);
    
    

      const humanMove = (index: number) =>{
        if(!grid[index] && nextMove === players.human){
            move(index, players.human);
            setNextMove(players.ai);
        }
    };


    const choosePlayer = (option: number) => {
        setPlayers({human: option, ai: switchPlayer(option) });
        setGameState(GAME_STATES.inProgess);

        setNextMove(PLAYER_X);
    };




    const startNewGame = () => {
      setGameState(GAME_STATES.notStarted);
      setGrid(arr);
      setModalOpen(false);
    };

   


    const changeMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setMode(e.target.value);
    };


  



   return gameState === GAME_STATES.notStarted ? (
      <div>
        <Inner>
        <p>Select difficulty</p>
          <select onChange={changeMode} value={mode}>
            {Object.keys(GAME_MODES).map(key => {
              const gameMode = GAME_MODES[key];
              return(
                <option key={gameMode} value={gameMode}>
                  {key}
                </option>
              );
            })}
          </select>
        </Inner>
        <Inner>
          <p>Choose your player</p>
          <ButtonRow>
            <button onClick={() => choosePlayer(PLAYER_X)}>X</button>
            <p>or</p>
            <button onClick={() => choosePlayer(PLAYER_O)}>O</button>
          </ButtonRow>
        </Inner>
      </div>
   ) : (
    <Container dims={DIMENSIONS}>
    {grid.map((value, index) => {
      const isActive = value !== null;

      return (
        <Square data-testid={`square_${index}`} key={index} onClick={() => humanMove(index)}>
          {isActive && <Marker>{value === PLAYER_X ? "X" : "O"}</Marker>}
        </Square>
      );
    })}
    <Strikethrough
      styles={
        gameState ===GAME_STATES.over ? board.getStrikethroughStyles() : ""
      }
      />
      <ResultModal 
      isOpen={modalOpen}
      winner={winner}
      close={() => setModalOpen(false)}
      startNewGame={startNewGame}
      />
    </Container>
   );

} 

const Strikethrough = styled.div<{ styles: string | null }>`
  position: absolute;
  ${({ styles }) => styles}
  background-color: indianred;
  height: 5px;
  width: ${({ styles }) => !styles && "0px"};
`;    

const ButtonRow = styled.div`
  display: flex;
  width: 150px;
  justify-content: space-between;
`;
 
const Inner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

const Container = styled.div<{ dims: number}>`
    display: flex;
    justify-content: center;
    width: ${({ dims }) => `${dims * (SQUARE_DIMS + 5)}px`};
    flex-flow: wrap;
    position: relative;
    }
`;

const Square = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: ${SQUARE_DIMS}px;
    height: ${SQUARE_DIMS}px;
    ${border}

    &:hover {
    cursor: pointer;
    }
`;

const Marker = styled.p`
    font-size: 68px;
`;

