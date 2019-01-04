import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className={ props.className } onClick={ props.onClick }>
            { props.value }
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i, className) {
        return (
            <Square
                key={i}
                className={className}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        let x = 0;
        let rows = [];
        for (let i = 0; i < 3; i++) {
            let cols = [];
            for (let j = 0; j < 3; j++) {
                if (this.props.winningSquares != null && this.props.winningSquares.indexOf(x) > -1) {
                    cols.push(this.renderSquare(x, "square square-winner"));
                } else {
                    cols.push(this.renderSquare(x, "square"));
                }
                x++;
            }
            rows.push(<div key={i} className="board-row">{cols}</div>);
        }
        return <div>{rows}</div>;        
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                stepNumber: 0,
                x: null,
                y: null,
            }],
            sortOrder: 0,
            stepNumber: 0,
            xIsNext: true,            
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (getWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares : squares,
                stepNumber: history.length,
                x : Math.trunc(i / 3),
                y : i % 3,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    bold(content) {
        return ( <strong>{content}</strong> );
    }

    sortHistoryAsc(a, b) {
        if (a.stepNumber < b.stepNumber) return -1;
        if (a.stepNumber > b.stepNumber) return 1;
        return 0;
    }

    sortHistoryDesc(a, b) {
        if (a.stepNumber < b.stepNumber) return 1;
        if (a.stepNumber > b.stepNumber) return -1;
        return 0;
    }

    toggleSort() {        
        let currentSort = this.state.sortOrder;
        this.setState({ sortOrder: currentSort === 0 ? 1 : 0 });        
        return;
    }

    render() {
        const history = this.state.history;        
        this.state.sortOrder === 0 ? history.sort(this.sortHistoryAsc) : history.sort(this.sortHistoryDesc);
        
        const current = history.find(x => x.stepNumber === this.state.stepNumber);
        const winner = getWinner(current.squares);
        const winningSquares = getWinningSquares(current.squares);
        
        const movesSort = <button onClick={() => this.toggleSort()}>Sort Moves</button>;

        const moves = history.map((step) => {
            const desc = step.stepNumber ? 
                'Go to move #' + step.stepNumber + ' (' + step.x + ',' + step.y + ')' :
                'Go to game start';
            return (
                <li key={step.stepNumber}>
                    <button onClick={() => this.jumpTo(step.stepNumber)}>{this.state.stepNumber === step.stepNumber ? this.bold(desc) : desc}</button>                    
                </li>
            );

        });

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            if (this.state.stepNumber === 9) {
                status = 'Match Drawn';
            } else {
                status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
            }
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board 
                        squares={current.squares}
                        winningSquares={winningSquares}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ul><li>{movesSort}</li></ul>
                    <ul>{moves}</ul>
                </div>
            </div>
        );
    }
}

function checkWinning(squares, getWinner) {
    const lines = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a,b,c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            if (getWinner) {
                return squares[a];
            } else {
                return lines[i];
            }
        }
    }
    return;
}

function getWinner(squares) {    
    return checkWinning(squares, true);
}

function getWinningSquares(squares) {
    return checkWinning(squares, false);
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
