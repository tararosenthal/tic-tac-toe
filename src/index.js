import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
  return (
    <button className={`square ${props.winner ? "winner" : ""}`} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square key={i}
      value={this.props.squares[i]}
      winner={this.props.winningMoves.includes(i)}
      onClick={() => this.props.onClick(i)} />
    );
  }

  render() {
    const board = Array(3).fill(null).map((row, rowNumber) => {
      return (
        <div key={`rowNumber${rowNumber}`} className="board-row">
          {Array(3).fill(null).map((col, colNumber) => {
            return this.renderSquare(rowNumber * 3 + colNumber)
          })}
      </div>
      );
    });

    return (
      <div>
        {board}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null)
      }],
      stepNumber: 0,
      turn: 'X',
      listOrderAsc: true,
      winningMoves: []
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    let endOfGame = checkForEndOfGame(squares);

    if (squares[i] || endOfGame.draw || endOfGame.winner) {
      return;
    }

    squares[i] = this.state.turn;
    endOfGame = checkForEndOfGame(squares);
    this.setState({
      history: history.concat([{
        squares: squares
      }]),
      stepNumber: history.length,
      turn: this.state.turn === 'X' ? 'O' : 'X',
      winningMoves: endOfGame.winningMoves
    });
  }

  jumpTo(stepNumber) {
    const endOfGame = checkForEndOfGame(this.state.history[stepNumber].squares);
    this.setState({
      stepNumber: stepNumber,
      turn: stepNumber % 2 === 0 ? 'X' : 'O',
      winningMoves: endOfGame.winningMoves
    });
  }

  toggleListOrder() {
    this.setState({
      listOrderAsc: !this.state.listOrderAsc
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const endOfGame = checkForEndOfGame(current.squares);

    const moves = history.map((element, index) => {
      let moveCoordinates;
      if (index > 0) {
        const curr = this.state.history[index].squares;
        const prev = this.state.history[index - 1].squares;
        for (let i = 0; i < curr.length; i++) {
          if (curr[i] !== prev[i]) {
            moveCoordinates = [Math.floor(i / 3) + 1, i % 3 + 1];
          }
        }
      }

      const description = index ?
       `Go to move #${index} at row: ${moveCoordinates[0]}, col: ${moveCoordinates[1]}`:
       "Go to game start";

       if (index == this.state.stepNumber) {
        return (
          <li key={`move${index}`}>
            <button onClick={() => this.jumpTo(index)}><strong>{description}</strong></button>
          </li>
        );
       }

       return (
         <li key={`move${index}`}>
           <button onClick={() => this.jumpTo(index)}>{description}</button>
         </li>
       );
    });

    let reversed = false;
    if (!this.state.listOrderAsc) {
      moves.reverse();
      reversed = true;
    }

    let status;
    if (endOfGame.draw) {
      status = "Tie game";
    } else if(endOfGame.winner) {
      status = `Winner: ${endOfGame.winner}`;
    } else {
      status = `Next player: ${this.state.turn}`;
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares}
          winningMoves={this.state.winningMoves}
          onClick={(i) => this.handleClick(i)}/>
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button className="toggle" onClick={() => this.toggleListOrder()}>Reverse list order</button>
          <ol reversed={reversed}>{moves}</ol>
        </div>
      </div>
    );
  }
}

function checkForEndOfGame(squares) {
  const endConditions = {
    draw: false,
    winner: null,
    winningMoves: []
  };

  const winnerAndMoves = calculateWinnerAndMoves(squares);
  endConditions.winner = winnerAndMoves.winner;
  endConditions.winningMoves = winnerAndMoves.winningMoves;

  if (!endConditions.winner) {
    endConditions.draw = checkForDraw(squares);
  }

  return endConditions;
}

function calculateWinnerAndMoves(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const winnerAndMoves = {
    winner: null,
    winningMoves: []
  };

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      winnerAndMoves.winner = squares[a];
      winnerAndMoves.winningMoves = lines[i];
    }
  }
  return winnerAndMoves;
}

function checkForDraw(squares) {
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] == null) {
      return false;
    }
  }
  return true;
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
