const game = (function () {
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');

    let rows = 3;
    let cols = 3;

    const board = (function () {
        let board = [];
        let cellNum = 1;
        for (let i = 0; i < rows; i++) {
            let row = [];
            for (let i = 0; i < cols; i++) {
                row.push(cellNum);
                cellNum++;
            }
            board.push(row);
        }
        function get() {
            return board;
        }
        return { get };
    })();

    const winConditions = (function () {
        const arr = board.get();
        let wins = [];

        // Row
        arr.forEach(row => {
            wins.push(row);
        });

        // Col
        for (i = 0; i < arr.length; i++) {
            let col = arr.map(row => row[i]);
            wins.push(col);
        }

        // Diags
        diag1 = arr.map((row, i) => row[i]);
        diag2 = arr.map((row, i) => row[arr.length - 1 - i]);

        wins.push(diag1, diag2);

        function get() {
            return wins;
        }

        const check = (owned, targets) => targets.find(target => target.every(t => owned.includes(t)));


        return { get, check };
    })();

    const player = (function () {
        const p1 = {
            num: 1,
            name: '',
            symbol: "✕",
            ownedCells: []
        }
        const p2 = {
            num: 2,
            name: '',
            symbol: "○",
            ownedCells: []
        }

        let activePlayer = p1;

        function current() {
            return activePlayer;
        }
        function claim(cell) {
            const num = parseInt(cell.dataset.cell);

            activePlayer.ownedCells.push(num);
            cell.textContent = activePlayer.symbol;
            cell.classList.add('claimed');
            if (activePlayer.num === 1) {
                cell.classList.add('p1cell');
            } else {
                cell.classList.add('p2cell');
            }
        }
        function swap() {
            activePlayer = activePlayer === p1 ? p2 : p1;
        }
        function getClaimedCells() {
            let cells = p1.ownedCells.concat(p2.ownedCells);
            return cells;
        }
        function assignNames(p1name, p2name) {
            p1.name = p1name;
            p2.name = p2name;
        }
        function getNames() {
            return {P1: p1.name, P2: p2.name}
        }
        return { current, claim, swap, getClaimedCells, assignNames, getNames };
    })();

    const ui = (function () {
        function selectCell(event) {
            playTurn(event.currentTarget);
        }

        function show(target) {
                target.style.display = 'flex';
        }
        function hide(target) {
                target.style.display = 'none';
        }


        function prepare() {
            const cells = document.querySelectorAll('.cell');
            const numbers = board.get().flat();

            cells.forEach((cell, i) => {
                cell.dataset.cell = numbers[i];
                cell.textContent = '';
                cell.classList.remove('claimed');
                cell.addEventListener('click', selectCell);
            });
            const names = player.getNames();
            document.getElementById('player-names').textContent = names.P1 + ' vs ' + names.P2;
            displayMessage(names.P1 + '\'s turn')

        }

        function displayMessage(message) {
            document.getElementById('game-message').textContent = message;
        }

        function highlightWin(match) {
            console.log(match);
            const numberSet = new Set(match.map(String));
            document.querySelectorAll('.cell').forEach(cell => {
                const id = cell.dataset.cell;
                console.log(id);
                if (numberSet.has(id)) {
                    cell.classList.add('winner');
                }
            });
        }

        // gameEnd
        return { prepare, show, hide, displayMessage, highlightWin };
    })();


    function playTurn(cell) {
        let p = player.current();
        player.claim(cell);
        let conditions = winConditions.get();
        let gameover = false;
        let match = winConditions.check(p.ownedCells, conditions);

        if (match) {
            game.win(p, match);
        } else if (player.getClaimedCells().length === 9) {
            game.tie();
        } else {
            player.swap();
            ui.displayMessage(player.current().name + '\'s turn');
        }
    }

    function win(p, match) {
        let cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.add('claimed');
        });
        ui.displayMessage(p.name + ' wins!');
        ui.highlightWin(match);
        ui.show(endScreen);
    }

    function tie() {
        ui.displayMessage('It\'s a Tie!');
    }

    function newGame() {
        let p1nameInput = document.getElementById('player1name');
        let p2nameInput = document.getElementById('player2name');
        let p1name = p1nameInput.value ? p1nameInput.value : 'Unknown';
        let p2name = p2nameInput.value ? p2nameInput.value : 'Unknown';

        player.assignNames(p1name, p2name);
        ui.prepare();
        ui.hide(startScreen);
        ui.show(gameScreen);
    }

    let beginBtn = document.getElementById('beginBtn');
    beginBtn.addEventListener('click', newGame);


    let rematchBtn = document.getElementById('rematchBtn');
    let resetBtn = document.getElementById('resetBtn');

    return { board, player, winConditions, ui, playTurn, win, tie, newGame }
})();