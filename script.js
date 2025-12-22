const game = (function () {
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
        diag2 = arr.map((row, i) => row[arr.length -1 - i]);

        wins.push(diag1, diag2);

        const check = (owned, target) => target.every(t => owned.includes(t)); 
    
        return {check};
    })();


    const players = (function () {
        const p1 = {
            player: 1,
            symbol: "X",
            ownedCells: []
        }
        const p2 = {
            player: 2,
            symbol: "O",
            ownedCells: []
        }

        let activePlayer = p1;

        function getActivePlayer() {
            return activePlayer;
        }
        function claimCell(cell) {
            activePlayer.ownedCells.push(cell);
        }
        function switchPlayer() {
            activePlayer = activePlayer === p1 ? p2 : p1;
        }
        function getClaimedCells() {
            let cells = p1.ownedCells.concat(p2.ownedCells);
            return cells;
        }
        return { getActivePlayer, claimCell, switchPlayer, getClaimedCells };
    })();

    const ui = (function () {
        // Draw
        // placeMarker
        // Reset
        // gameEnd
    })();


    function playTurn(cell) {
        let player = players.getActivePlayer();
        player.ownedCells.push(cell);

        let conditions = winConditions.get();

        conditions.forEach(cond => {
            let match = winConditions.check(player.ownedCells, cond);
            if (match) {
                // Winning match has been found
                game.win(player);
            } else if (players.getClaimedCells().length === 9) {
                game.tie();
            }
        });

        players.switchPlayer();

        // Check if game is won (matches win conditions) or tied (all cells claimed)

    }

    function win(player) {
        console.log(player.player + ' wins!');
    }

    function tie() {
        console.log('DRAW');
    }
    return { board, players, winConditions, playTurn, win, tie }
})();