class Board {
    constructor() {
        this.cells = [
            {
                id: 1,
                value: ' ',
            },
            {
                id: 2,
                value: ' ',
            },
            {
                id: 3,
                value: ' ',
            },
            {
                id: 4,
                value: ' ',
            },
            {
                id: 5,
                value: ' ',
            },
            {
                id: 6,
                value: ' ',
            },
            {
                id: 7,
                value: ' ',
            },
            {
                id: 8,
                value: ' ',
            },
            {
                id: 9,
                value: ' ',
            },
        ];
    }

    print() {
        for (let i = 0; i < 9; i++) {
            process.stdout.write(this.cells[i]);
        }
    }

    isCellSelected(num) {
        let cell = this.cells.find(({ id }) => id == num)
        return cell.value !== ' ';
    }

    takeTurnFirst(num) {
        let cell = this.cells.find(({ id }) => id == num)
        return cell.value = 'X';
    }

    takeTurnSecond(num) {
        let cell = this.cells.find(({ id }) => id == num)
        return cell.value = 'O';
    }

    getAvailableCell() {
        let availableCells = this.cells.filter(cell => cell.value == ' ');
        return availableCells;
    }

    // need fixing ->
    getWinner() {
        let combos = [
            [{ id: 1 }, { id: 2 }, { id: 3 }],
            [{ id: 4 }, { id: 5 }, { id: 6 }],
            [{ id: 7 }, { id: 8 }, { id: 9 }],
            [{ id: 1 }, { id: 4 }, { id: 7 }],
            [{ id: 2 }, { id: 5 }, { id: 8 }],
            [{ id: 3 }, { id: 6 }, { id: 9 }],
            [{ id: 1 }, { id: 5 }, { id: 9 }],
            [{ id: 3 }, { id: 5 }, { id: 7 }],
        ];
        for (let i = 0; i < 8; i++) {
            const combo = [];

            if (combo[0] != ' ' && combo[0] == combo[1] && combo[1] == combo[2]) {
                return combo[0];
            }
        }

        return this.getAvailableCell().length == 0 ? 'Me' : null;
    }
}

module.exports = Board;