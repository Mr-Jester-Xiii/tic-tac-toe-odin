const game = (function () {
    const board = (function () {
        let rows = 3;
        let cols = 3;
        let board = [];

        for (let i = 0; i < (rows * cols); i++) {
            board.push(null);
        }

        function reset() {
            board.fill(null);
        }

        function setCell(index, symbol) {
            board[index] = symbol;
            ui.placeSymbol(index, symbol);
        }

        function get() {
            return board;
        }
        return {
            reset,
            setCell,
            get
        }
    })();

    const playerManager = (function () {
        player1 = {
            num: 1,
            name: null,
            symbol: "✕"
        };
        player2 = {
            num: 2,
            name: null,
            symbol: "○"
        };

        let currentPlayer = null;

        function setPlayers(name1, name2) {
            player1.name = name1;
            player2.name = name2;
            currentPlayer = player1;
        }

        function swapPlayer() {
            currentPlayer = currentPlayer === player1 ? player2 : player1;
        }

        function getCurrentPlayer() {
            return currentPlayer
        }

        function getNames() {
            return [player1.name, player2.name];
        }
        return {
            setPlayers,
            swapPlayer,
            getCurrentPlayer,
            getNames
        }
    })();

    const logic = (function () {
        // Responsible for all win/tie rules and game conditions
        const winConditions = [
            // Rows
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            //Columns
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            //Diagonals
            [0, 4, 8],
            [2, 4, 6]
        ];

        function checkEnd(player) {
            const gameState = {
                end: false,
                tie: false,
                match: null
            };

            const boardState = board.get();
            const symbol = player.symbol;
            let winPattern = winConditions.find(condition => condition.every(index => boardState[index] === symbol));
            if (winPattern) {
                gameState.end = true;
                gameState.match = winPattern;
            } else {
                let nullsInBoard = boardState.some(cell => cell === null);
                if (!nullsInBoard) {
                    gameState.end = true;
                    gameState.tie = true;
                }
            }
            return gameState;
        }
        return {
            checkEnd
        }
    })();

    const ui = (function () {
        // Responsible for displaying information and capturing input
        // Function to assign board index values to cells.
        const cells = document.querySelectorAll('.cell');

        const prepareBoard = (function () {
            cells.forEach((cell, i) => {
                cell.dataset.cell = i;
                cell.onclick = () => playTurn(i);
            });
        })();

        const assignButtonFunction = (function () {
            const beginBtn = document.getElementById('beginBtn');
            beginBtn.onclick = () => newGame();

            const rematchBtn = document.getElementById('rematchBtn');
            rematchBtn.onclick = () => rematch();

            const resetBtn = document.getElementById('resetBtn');
            resetBtn.onclick = () => reset();
        })();

        // Function to populate a cell with the current players symbol
        function placeSymbol(i, symbol) {
            const cell = document.querySelector(`[data-cell='${i}']`);
            cell.textContent = symbol;
            cell.classList.add('locked');
            symbol === "✕" ? cell.classList.add('p1cell') : cell.classList.add('p2cell');
        }

        // Function(s) to handle UI messaging (X's Turn, X wins etc);
        function displayMessage(message) {
            document.getElementById('game-message').textContent = message;
        }

        function populateTitle(name1, name2) {
            document.getElementById('player-names').textContent = name1 + ' vs ' + name2;
        }

        // Function to take name input from inputs and call player name assignment.
        function populateNames() {
            const p1nameInput = document.getElementById('player1name');
            const p2nameInput = document.getElementById('player2name');
            const p1name = p1nameInput.value ? p1nameInput.value : 'Unknown';
            const p2name = p2nameInput.value ? p2nameInput.value : 'Unknown';

            return [p1name, p2name];
        }

        // Show/hide intro page + win screen
        function showDiv(id, bool) {
            const div = document.getElementById(id);
            if (bool) {
                div.style.display = 'flex';
            } else {
                div.style.display = 'none';
            }
        }

        // Highlight the winning row/col on the board
        function highlightWin(match) {
            const numberSet = new Set(match.map(String));
            cells.forEach(cell => {
                const id = cell.dataset.cell;
                console.log(id);
                if (numberSet.has(id)) {
                    cell.classList.add('winner');
                }
            });
        }

        // Reset the board (Empty divs, remove highlighting classes.)
        function resetBoard() {
            cells.forEach(cell => {
                cell.textContent = '';
                cell.classList.remove('p1cell', 'p2cell', 'locked', 'winner');
            });
        }

        function lockBoard() {
            cells.forEach(cell => {
                cell.classList.add('locked');
            });
        }

        return {
            placeSymbol,
            displayMessage,
            populateTitle,
            populateNames,
            showDiv,
            highlightWin,
            resetBoard,
            lockBoard
        }
    })();

    // Core functions
    function newGame() {
        let [name1, name2] = ui.populateNames();
        playerManager.setPlayers(name1, name2);
        ui.populateTitle(name1, name2);
        ui.displayMessage(name1 + '\'s turn.');
        ui.showDiv('start-screen', false);
        ui.showDiv('game-screen', true);
    };
    function reset() {
        ui.showDiv('start-screen', true);
        ui.showDiv('game-screen', false);
        ui.showDiv('end-screen', false);
        board.reset();
        ui.resetBoard();
    };
    function rematch() {
        ui.resetBoard();
        board.reset();
        ui.showDiv('end-screen', false);
        const [name1, name2] = playerManager.getNames();
        playerManager.setPlayers(name1, name2);
        ui.displayMessage(name1 + '\'s turn.');
    };
    function playTurn(cell) {
        let p = playerManager.getCurrentPlayer();
        board.setCell(cell, p.symbol);
        gameState = logic.checkEnd(p);
        console.log(gameState);
        if (gameState.end) {
            if (gameState.tie) {
                gameTie();
            } else {
                gameWon(p);
                ui.highlightWin(gameState.match);
            }
        } else {
            playerManager.swapPlayer();
            p = playerManager.getCurrentPlayer();
            ui.displayMessage(p.name + '\'s turn.')
        }
    }
    function gameTie() {
        ui.lockBoard();
        ui.displayMessage('It\'s a Tie!');
        ui.showDiv('end-screen', true);
    }
    function gameWon(p) {
        ui.lockBoard();
        ui.displayMessage(p.name + ' wins!');
        ui.showDiv('end-screen', true);
    }
})();
