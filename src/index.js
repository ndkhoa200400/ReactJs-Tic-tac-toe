import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
function Square(props) {
  return (
    <button
      className={`square ${props.isWonMove ? "won-move" : null}`}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const wonSquares = this.props.wonSquares;
    const isWonMove = wonSquares.includes(i);

    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        isWonMove={isWonMove}
      />
    );
  }

  renderColumns(row) {
    const cols = [];
    for (let i = 0; i < this.props.size; i++) {
      cols.push(this.renderSquare(i + row * this.props.size));
    }
    return cols;
  }

  renderRows() {
    const columns = [];
    for (let i = 0; i < this.props.size; i++) {
      columns.push(
        <div className="board-row" key={i}>
          {this.renderColumns(i).map((row) => row)}
        </div>
      );
    }
    return columns;
  }
  render() {
    return <div>{this.renderRows().map((value) => value)}</div>;
  }
}

class Game extends React.Component {
  size;

  constructor(props) {
    super(props);
    this.size = props.size;
    this.state = {
      history: [
        {
          squares: Array(this.size * this.size).fill(null),
          currentMove: null,
          order: 0,
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      wonSquares: [],
      isSort: false,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          currentMove: i,
          order: current.order + 1,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  sortMove() {
    this.setState({
      isSort: !this.state.isSort,
    });
  }
  render() {
    const history = [...this.state.history];
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    if (this.state.isSort) {
      history.reverse();
    }
    const moves = history.map((step) => {
      const move = step.order;
      const desc = move
        ? `Go to move #${move}: (${(step.currentMove % +this.props.size) + 1},${
            parseInt(step.currentMove / this.props.size) + 1
          })`
        : "Go to game start";
      return (
        <li key={move}>
          <button
            onClick={() => this.jumpTo(move)}
            className={move === this.state.stepNumber ? "hightlight" : null}
          >
            {desc}
          </button>
        </li>
      );
    });
    let wonSquares;
    let status;
    if (winner) {
      status = "Winner: " + winner.turn;
      wonSquares = winner.squares;
    } else {
      if (current.squares.includes(null))
        status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      else status = "Draw";
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            size={this.size}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            wonSquares={wonSquares ?? []}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div className="container">
            <div className="toggle-switch">
              <input
                type="checkbox"
                className="checkbox"
                id="toggleButton"
                onChange={() => this.sortMove()}
              />
              <label className="label" htmlFor="toggleButton">
                <span className="inner" />
                <span className="switch" />
              </label>
            </div>
          </div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      size: 5,
      isStart: false,
    };
  }
  handleSubmit = (e) => {
    const { size } = this.state;
    if (size < 5) {
      return alert("Giá trị tối thiểu là 5");
    }
    this.setState({ isStart: true });
  };
  render() {
    const { size, isStart } = this.state;

    return isStart ? (
      <div>
        <button
          className="button"
          onClick={() => this.setState({ isStart: false })}
        >
          Quay về
        </button>
        <Game size={size} />
      </div>
    ) : (
      <div>
        <div>
          <label htmlFor="row-input">Nhập kích cỡ bàn cờ</label>
          <input
            id="row-input"
            type="number"
            value={size}
            min={5}
            placeholder="Nhập kích cỡ"
            onChange={(e) => this.setState({ size: e.target.value })}
          />
        </div>
        <button className="button" type="submit" onClick={this.handleSubmit}>
          Đồng ý
        </button>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Map />, document.getElementById("root"));

function calculateWinner(squares) {
  const size = parseInt(Math.sqrt(squares.length));
  // check row
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size - 4; j++) {
      let isWin = true;
      const position = i * size + j;

      if (!squares[position]) {
        continue;
      }
      let wonSquares = [position];
      for (let streak = 1; streak < 5; streak++) {
        if (squares[position] !== squares[position + streak]) {
          isWin = false;
          break;
        }
        wonSquares.push(position + streak);
      }
      if (isWin) return { turn: squares[position], squares: wonSquares };
      wonSquares = [];
    }
  }

  // check column
  for (let j = 0; j < size - 4; j++) {
    for (let i = 0; i < size; i++) {
      let isWin = true;
      const position = j * size + i;

      if (!squares[position]) {
        continue;
      }
      let wonSquares = [position];
      for (let streak = 1; streak < 5; streak++) {
        if (squares[position] !== squares[position + streak * size]) {
          isWin = false;
          break;
        }
        wonSquares.push(position + streak * size);
      }
      if (isWin) return { turn: squares[position], squares: wonSquares };
      wonSquares = [];
    }
  }

  // primary diag
  for (let position = 0; position < size * size; position++) {
    let isWin = true;

    if (!squares[position]) {
      continue;
    }
    let wonSquares = [position];
    for (let streak = 1; streak < 5; streak++) {
      if (
        position + streak * (size + 1) > squares.length || // check if it exceeds row
        squares[position] !== squares[position + streak * (size + 1)]
      ) {
        isWin = false;
        break;
      }
      wonSquares.push(position + streak * (size + 1));
    }
    if (isWin) return { turn: squares[position], squares: wonSquares };
  }

  // secondary diag
  for (let position = 0; position < size * size; position++) {
    let isWin = true;

    // check if null or at column can't win
    if (!squares[position] || position % size < 4) {
      continue;
    }

    let wonSquares = [position];

    for (let streak = 1; streak < 5; streak++) {
      let nextPosition = position + streak * (size - 1);
      if (nextPosition < 0 || squares[position] !== squares[nextPosition]) {
        isWin = false;
        break;
      }

      wonSquares.push(nextPosition);
    }
    if (isWin) return { turn: squares[position], squares: wonSquares };
    wonSquares = [];
  }

  return null;
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
