class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.bestScore = localStorage.getItem('bestScore') || 0;
        this.size = 4;
        this.gameWon = false;
        this.gameTerminated = false;
        
        this.tileContainer = document.getElementById('tile-container');
        this.scoreContainer = document.getElementById('score');
        this.bestScoreContainer = document.getElementById('best-score');
        this.gameMessageContainer = document.getElementById('game-message');
        this.restartButton = document.getElementById('restart-button');
        this.keepPlayingButton = document.getElementById('keep-playing-button');
        this.retryButton = document.getElementById('retry-button');
        

        
        this.init();
        this.setupEventListeners();
        this.createParticles();
    }
    
    init() {
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.gameWon = false;
        this.gameTerminated = false;
        
        this.updateScore();
        this.updateBestScore();
        this.clearContainer(this.tileContainer);
        this.hideGameMessage();
        

        
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
    }
    

    
    createEmptyGrid() {
        const grid = [];
        for (let i = 0; i < this.size; i++) {
            grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                grid[i][j] = null;
            }
        }
        return grid;
    }
    
    addRandomTile() {
        const emptyCells = this.getEmptyCells();
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            this.grid[randomCell.x][randomCell.y] = {
                value: value,
                isNew: true,
                isMerged: false
            };
        }
    }
    
    getEmptyCells() {
        const cells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (!this.grid[i][j]) {
                    cells.push({ x: i, y: j });
                }
            }
        }
        return cells;
    }
    
    updateDisplay() {
        this.clearContainer(this.tileContainer);
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const tile = this.grid[i][j];
                if (tile) {
                    this.addTile(i, j, tile.value, tile.isNew, tile.isMerged);
                }
            }
        }
        
        // 重置动画标志
        setTimeout(() => {
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    if (this.grid[i][j]) {
                        this.grid[i][j].isNew = false;
                        this.grid[i][j].isMerged = false;
                    }
                }
            }
        }, 200);
    }
    
    addTile(x, y, value, isNew = false, isMerged = false) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        if (isNew) tile.classList.add('tile-new');
        if (isMerged) tile.classList.add('tile-merged');
        
        tile.textContent = value;
        
        // 使用data属性进行CSS定位
        tile.setAttribute('data-x', x);
        tile.setAttribute('data-y', y);
        
        this.tileContainer.appendChild(tile);
    }
    
    clearContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }
    
    move(direction) {
        if (this.gameTerminated) return;
        
        const previousGrid = this.copyGrid(this.grid);
        let moved = false;
        
        switch (direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }
        
        if (moved) {
            this.addRandomTile();
            this.updateDisplay();
            this.updateScore();
            
            if (this.isGameWon() && !this.gameWon) {
                this.gameWon = true;
                this.showGameMessage('你赢了！', false);
            } else if (this.isGameOver()) {
                this.gameTerminated = true;
                this.showGameMessage('游戏结束！', true);
            }
        }
    }
    
    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(cell => cell !== null);
            const mergedRow = this.mergeRow(row);
            const newRow = mergedRow.concat(Array(this.size - mergedRow.length).fill(null));
            
            for (let j = 0; j < this.size; j++) {
                if (JSON.stringify(this.grid[i][j]) !== JSON.stringify(newRow[j])) {
                    moved = true;
                }
                this.grid[i][j] = newRow[j];
            }
        }
        return moved;
    }
    
    moveRight() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(cell => cell !== null);
            const mergedRow = this.mergeRow(row.reverse()).reverse();
            const newRow = Array(this.size - mergedRow.length).fill(null).concat(mergedRow);
            
            for (let j = 0; j < this.size; j++) {
                if (JSON.stringify(this.grid[i][j]) !== JSON.stringify(newRow[j])) {
                    moved = true;
                }
                this.grid[i][j] = newRow[j];
            }
        }
        return moved;
    }
    
    moveUp() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j]) column.push(this.grid[i][j]);
            }
            const mergedColumn = this.mergeRow(column);
            
            for (let i = 0; i < this.size; i++) {
                const newValue = i < mergedColumn.length ? mergedColumn[i] : null;
                if (JSON.stringify(this.grid[i][j]) !== JSON.stringify(newValue)) {
                    moved = true;
                }
                this.grid[i][j] = newValue;
            }
        }
        return moved;
    }
    
    moveDown() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j]) column.push(this.grid[i][j]);
            }
            const mergedColumn = this.mergeRow(column.reverse()).reverse();
            
            for (let i = 0; i < this.size; i++) {
                const newValue = i >= this.size - mergedColumn.length ? 
                    mergedColumn[i - (this.size - mergedColumn.length)] : null;
                if (JSON.stringify(this.grid[i][j]) !== JSON.stringify(newValue)) {
                    moved = true;
                }
                this.grid[i][j] = newValue;
            }
        }
        return moved;
    }
    
    mergeRow(row) {
        const merged = [];
        let i = 0;
        
        while (i < row.length) {
            if (i < row.length - 1 && row[i].value === row[i + 1].value) {
                const newValue = row[i].value * 2;
                merged.push({
                    value: newValue,
                    isNew: false,
                    isMerged: true
                });
                this.score += newValue;
                i += 2;
            } else {
                merged.push({
                    value: row[i].value,
                    isNew: false,
                    isMerged: false
                });
                i++;
            }
        }
        
        return merged;
    }
    
    copyGrid(grid) {
        return grid.map(row => row.map(cell => cell ? { ...cell } : null));
    }
    
    isGameWon() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] && this.grid[i][j].value === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
    
    isGameOver() {
        // 检查是否有空格
        if (this.getEmptyCells().length > 0) return false;
        
        // 检查是否可以合并
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j].value;
                if ((i < this.size - 1 && this.grid[i + 1][j].value === current) ||
                    (j < this.size - 1 && this.grid[i][j + 1].value === current)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    updateScore() {
        this.scoreContainer.textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.updateBestScore();
            localStorage.setItem('bestScore', this.bestScore);
        }
    }
    
    updateBestScore() {
        this.bestScoreContainer.textContent = this.bestScore;
    }
    
    showGameMessage(message, isGameOver) {
        this.gameMessageContainer.querySelector('p').textContent = message;
        this.gameMessageContainer.style.display = 'flex';
        
        if (isGameOver) {
            this.keepPlayingButton.style.display = 'none';
            this.retryButton.style.display = 'inline-block';
        } else {
            this.keepPlayingButton.style.display = 'inline-block';
            this.retryButton.style.display = 'inline-block';
        }
    }
    
    hideGameMessage() {
        this.gameMessageContainer.style.display = 'none';
    }
    
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (this.gameTerminated) return;
            
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.move('right');
                    break;
            }
        });
        
        // 触摸事件
        let startX, startY;
        
        this.tileContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        });
        
        this.tileContainer.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!startX || !startY) return;
            
            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipeDistance) {
                    this.move(deltaX > 0 ? 'right' : 'left');
                }
            } else {
                if (Math.abs(deltaY) > minSwipeDistance) {
                    this.move(deltaY > 0 ? 'down' : 'up');
                }
            }
            
            startX = null;
            startY = null;
        });
        
        // 按钮事件
        this.restartButton.addEventListener('click', () => this.init());
        this.retryButton.addEventListener('click', () => this.init());
        this.keepPlayingButton.addEventListener('click', () => {
            this.hideGameMessage();
            this.gameTerminated = false;
        });
        
        // 窗口大小变化监听器，用于响应式布局
        window.addEventListener('resize', () => {
            // 延迟执行以确保CSS媒体查询已生效
            setTimeout(() => {
                this.updateDisplay();
            }, 100);
        });
        
        // 屏幕方向变化监听器
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateDisplay();
            }, 300);
        });
    }
    
    createParticles() {
        const particlesContainer = document.getElementById('particles');
        
        setInterval(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
            particle.style.animationDelay = Math.random() * 2 + 's';
            
            particlesContainer.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 8000);
        }, 300);
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});

// 防止页面滚动
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });