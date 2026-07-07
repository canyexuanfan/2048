class Game2048 {
    constructor() {
        this.size = 4;
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.bestScore = this.loadBestScore();
        this.tileId = 0;
        this.tiles = new Map();
        this.gameWon = false;
        this.gameTerminated = false;
        this.pendingMove = false;
        this.touchStart = null;

        this.tileContainer = document.getElementById('tile-container');
        this.gridContainer = document.getElementById('grid-container');
        this.gameContainer = document.getElementById('game-container');
        this.scoreContainer = document.getElementById('score');
        this.bestScoreContainer = document.getElementById('best-score');
        this.gameMessageContainer = document.getElementById('game-message');
        this.restartButton = document.getElementById('restart-button');
        this.keepPlayingButton = document.getElementById('keep-playing-button');
        this.retryButton = document.getElementById('retry-button');
        this.themeToggle = document.getElementById('theme-toggle');

        this.applyInitialTheme();
        this.newGame();
        this.setupEventListeners();
        this.createParticles();
    }

    createEmptyGrid() {
        return Array.from({ length: this.size }, () => Array(this.size).fill(null));
    }

    loadBestScore() {
        try {
            const primary = Number.parseInt(localStorage.getItem('bestScore'), 10);
            const legacy = Number.parseInt(localStorage.getItem('best2048'), 10);
            if (Number.isFinite(primary)) return primary;
            if (Number.isFinite(legacy)) return legacy;
        } catch (error) {
            console.warn('无法读取最高分记录：', error);
        }
        return 0;
    }

    saveBestScore() {
        try {
            localStorage.setItem('bestScore', String(this.bestScore));
        } catch (error) {
            console.warn('无法保存最高分记录：', error);
        }
    }

    newGame() {
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.tileId = 0;
        this.gameWon = false;
        this.gameTerminated = false;
        this.pendingMove = false;

        this.tiles.forEach(tile => tile.remove());
        this.tiles.clear();
        this.hideGameMessage();
        this.updateScore(false);
        this.updateBestScore();

        this.addRandomTile();
        this.addRandomTile();
        this.render();
    }

    getEmptyCells() {
        const cells = [];
        for (let row = 0; row < this.size; row += 1) {
            for (let col = 0; col < this.size; col += 1) {
                if (!this.grid[row][col]) {
                    cells.push({ row, col });
                }
            }
        }
        return cells;
    }

    addRandomTile() {
        const emptyCells = this.getEmptyCells();
        if (emptyCells.length === 0) return false;

        const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.grid[row][col] = {
            id: ++this.tileId,
            value: Math.random() < 0.9 ? 2 : 4,
            row,
            col,
            isNew: true,
            merged: false
        };
        return true;
    }

    move(direction) {
        if (this.gameTerminated || this.pendingMove) return;

        this.clearAnimationFlags();
        const moved = this.slide(direction);
        if (!moved) return;

        this.pendingMove = true;
        this.render();
        this.updateScore(true);

        window.setTimeout(() => {
            this.addRandomTile();
            this.render();
            this.pendingMove = false;

            if (this.isGameWon() && !this.gameWon) {
                this.gameWon = true;
                this.gameTerminated = true;
                this.showGameMessage('你赢了！', false);
                return;
            }

            if (!this.movesAvailable()) {
                this.gameTerminated = true;
                this.showGameMessage('游戏结束！', true);
            }
        }, 165);
    }

    slide(direction) {
        let moved = false;

        if (direction === 'left' || direction === 'right') {
            for (let row = 0; row < this.size; row += 1) {
                const currentLine = this.grid[row].filter(Boolean);
                const nextLine = this.processLine(currentLine, direction === 'right');

                for (let col = 0; col < this.size; col += 1) {
                    const nextTile = nextLine[col];
                    if (nextTile) {
                        nextTile.row = row;
                        nextTile.col = col;
                    }

                    if (!this.sameTile(this.grid[row][col], nextTile)) {
                        moved = true;
                    }
                }

                this.grid[row] = nextLine;
            }
            return moved;
        }

        for (let col = 0; col < this.size; col += 1) {
            const currentLine = [];
            for (let row = 0; row < this.size; row += 1) {
                if (this.grid[row][col]) currentLine.push(this.grid[row][col]);
            }

            const nextLine = this.processLine(currentLine, direction === 'down');

            for (let row = 0; row < this.size; row += 1) {
                const nextTile = nextLine[row];
                if (nextTile) {
                    nextTile.row = row;
                    nextTile.col = col;
                }

                if (!this.sameTile(this.grid[row][col], nextTile)) {
                    moved = true;
                }
                this.grid[row][col] = nextTile;
            }
        }

        return moved;
    }

    processLine(line, reverse) {
        const workingLine = reverse ? [...line].reverse() : [...line];
        const result = [];

        for (let index = 0; index < workingLine.length; index += 1) {
            const tile = workingLine[index];
            const nextTile = workingLine[index + 1];

            if (nextTile && tile.value === nextTile.value) {
                tile.value *= 2;
                tile.merged = true;
                this.score += tile.value;
                result.push(tile);
                index += 1;
            } else {
                result.push(tile);
            }
        }

        while (result.length < this.size) {
            result.push(null);
        }

        return reverse ? result.reverse() : result;
    }

    sameTile(tileA, tileB) {
        return (tileA ? tileA.id : null) === (tileB ? tileB.id : null);
    }

    clearAnimationFlags() {
        this.grid.flat().forEach(tile => {
            if (tile) {
                tile.isNew = false;
                tile.merged = false;
            }
        });
    }

    render() {
        const firstCell = this.gridContainer.querySelector('.grid-cell');
        if (!firstCell) return;

        const cellRect = firstCell.getBoundingClientRect();
        const gridStyles = getComputedStyle(this.gridContainer);
        const gap = Number.parseFloat(gridStyles.columnGap || gridStyles.gap) || 0;
        const cellSize = cellRect.width;
        document.documentElement.style.setProperty('--tile-size', `${cellSize}px`);

        const currentTiles = this.grid.flat().filter(Boolean);
        const currentIds = new Set(currentTiles.map(tile => tile.id));

        this.tiles.forEach((tileElement, id) => {
            if (!currentIds.has(id)) {
                tileElement.remove();
                this.tiles.delete(id);
            }
        });

        currentTiles.forEach(tile => {
            let tileElement = this.tiles.get(tile.id);
            if (!tileElement) {
                tileElement = document.createElement('div');
                this.tileContainer.appendChild(tileElement);
                this.tiles.set(tile.id, tileElement);
            }

            const tileClass = tile.value <= 2048 ? `tile-${tile.value}` : 'tile-super';
            const stateClasses = [
                tile.isNew ? 'tile-new' : '',
                tile.merged ? 'tile-merged' : ''
            ].filter(Boolean).join(' ');

            tileElement.className = `tile ${tileClass}${stateClasses ? ` ${stateClasses}` : ''}`;
            tileElement.textContent = tile.value;
            tileElement.style.transform = `translate3d(${tile.col * (cellSize + gap)}px, ${tile.row * (cellSize + gap)}px, 0)`;

            if (tile.isNew || tile.merged) {
                window.setTimeout(() => {
                    tile.isNew = false;
                    tile.merged = false;
                    const currentElement = this.tiles.get(tile.id);
                    if (currentElement) {
                        currentElement.classList.remove('tile-new', 'tile-merged');
                    }
                }, 240);
            }
        });
    }

    isGameWon() {
        return this.grid.flat().some(tile => tile && tile.value === 2048);
    }

    movesAvailable() {
        if (this.getEmptyCells().length > 0) return true;

        for (let row = 0; row < this.size; row += 1) {
            for (let col = 0; col < this.size; col += 1) {
                const tile = this.grid[row][col];
                const currentValue = tile.value;
                const right = col < this.size - 1 ? this.grid[row][col + 1] : null;
                const down = row < this.size - 1 ? this.grid[row + 1][col] : null;

                if ((right && right.value === currentValue) || (down && down.value === currentValue)) {
                    return true;
                }
            }
        }

        return false;
    }

    updateScore(shouldBump = false) {
        this.scoreContainer.textContent = this.score;

        if (shouldBump) {
            this.scoreContainer.classList.remove('bump');
            void this.scoreContainer.offsetWidth;
            this.scoreContainer.classList.add('bump');
        }

        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.updateBestScore();
            this.saveBestScore();
        }
    }

    updateBestScore() {
        this.bestScoreContainer.textContent = this.bestScore;
    }

    showGameMessage(message, isGameOver) {
        this.gameMessageContainer.querySelector('p').textContent = message;
        this.gameMessageContainer.classList.add('active');
        this.gameMessageContainer.setAttribute('aria-hidden', 'false');
        this.keepPlayingButton.style.display = isGameOver ? 'none' : 'inline-flex';
        this.retryButton.style.display = 'inline-flex';
    }

    hideGameMessage() {
        this.gameMessageContainer.classList.remove('active');
        this.gameMessageContainer.setAttribute('aria-hidden', 'true');
    }

    setupEventListeners() {
        const keyMap = {
            ArrowUp: 'up',
            ArrowDown: 'down',
            ArrowLeft: 'left',
            ArrowRight: 'right',
            w: 'up',
            W: 'up',
            s: 'down',
            S: 'down',
            a: 'left',
            A: 'left',
            d: 'right',
            D: 'right'
        };

        document.addEventListener('keydown', event => {
            const direction = keyMap[event.key];
            if (!direction) return;
            event.preventDefault();
            this.move(direction);
        });

        this.restartButton.addEventListener('click', () => this.newGame());
        this.retryButton.addEventListener('click', () => this.newGame());
        this.keepPlayingButton.addEventListener('click', () => {
            this.gameTerminated = false;
            this.hideGameMessage();
        });

        this.themeToggle.addEventListener('click', () => {
            this.applyTheme(this.currentTheme === 'dark' ? 'light' : 'dark');
        });

        this.gameContainer.addEventListener('touchstart', event => {
            if (event.touches.length !== 1) return;
            const touch = event.touches[0];
            this.touchStart = { x: touch.clientX, y: touch.clientY };
        }, { passive: true });

        this.gameContainer.addEventListener('touchmove', event => {
            event.preventDefault();
        }, { passive: false });

        this.gameContainer.addEventListener('touchend', event => {
            if (!this.touchStart) return;
            event.preventDefault();

            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - this.touchStart.x;
            const deltaY = touch.clientY - this.touchStart.y;
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);
            const minSwipeDistance = 30;

            if (Math.max(absX, absY) > minSwipeDistance) {
                if (absX > absY) {
                    this.move(deltaX > 0 ? 'right' : 'left');
                } else {
                    this.move(deltaY > 0 ? 'down' : 'up');
                }
            }

            this.touchStart = null;
        }, { passive: false });

        let resizeTimer;
        window.addEventListener('resize', () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(() => this.render(), 100);
        });

        window.addEventListener('orientationchange', () => {
            window.setTimeout(() => this.render(), 300);
        });
    }

    applyInitialTheme() {
        let preferredTheme = 'light';

        try {
            const savedTheme = localStorage.getItem('2048-theme');
            if (savedTheme === 'light' || savedTheme === 'dark') {
                preferredTheme = savedTheme;
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                preferredTheme = 'dark';
            }
        } catch (error) {
            console.warn('无法读取主题偏好：', error);
        }

        this.applyTheme(preferredTheme, false);
    }

    applyTheme(theme, shouldPersist = true) {
        this.currentTheme = theme;
        document.documentElement.dataset.theme = theme;

        const isDark = theme === 'dark';
        this.themeToggle.setAttribute('aria-pressed', String(isDark));
        this.themeToggle.setAttribute('aria-label', isDark ? '切换到浅色模式' : '切换到深色模式');
        this.themeToggle.title = isDark ? '切换到浅色模式' : '切换到深色模式';

        if (shouldPersist) {
            try {
                localStorage.setItem('2048-theme', theme);
            } catch (error) {
                console.warn('无法保存主题偏好：', error);
            }
        }
    }

    createParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        window.setInterval(() => {
            if (particlesContainer.childElementCount > 36) return;

            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${Math.random() * 3 + 3}s`;
            particle.style.animationDelay = `${Math.random() * 1.5}s`;

            particlesContainer.appendChild(particle);
            window.setTimeout(() => {
                particle.remove();
            }, 7600);
        }, 360);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
