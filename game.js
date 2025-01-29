class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size (4 tiles taller)
        this.canvas.width = 400;
        this.canvas.height = 520; // Increased by 4 tile heights (30 * 4 = 120)
        
        // Game state
        this.reset();
        
        // Event listeners
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Speed up button
        const speedUpBtn = document.getElementById('speedUp');
        speedUpBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.isSpeedUp = true;
                this.balls.forEach(ball => {
                    const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
                    const speedMultiplier = (this.normalSpeed * 2) / currentSpeed;
                    ball.vx *= speedMultiplier;
                    ball.vy *= speedMultiplier;
                });
                this.ballSpeed = this.normalSpeed * 2;
            }
        });
        
        // Restart button
        const restartBtn = document.getElementById('restartGame');
        restartBtn.addEventListener('click', () => {
            document.getElementById('gameOver').style.display = 'none';
            this.reset();
            this.init();
        });
        
        // Start game
        this.init();
        this.gameLoop();
    }
    
    reset() {
        this.level = 1;
        this.totalBalls = 1;
        this.remainingBalls = 1;
        this.nextRoundExtraBalls = 0;
        this.isPlaying = false;
        this.gameOver = false;
        this.ballsInPlay = 0;
        this.lastBallLaunchTime = 0;
        this.nextRoundStartX = null;
        this.isSpeedUp = false;
        
        // Ball properties
        this.balls = [];
        this.ballRadius = 6;
        this.normalSpeed = 7;
        this.ballSpeed = this.normalSpeed;
        this.ballLaunchDelay = 200;
        
        // Fixed ball position
        this.fixedBallPos = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 20
        };
        
        // Mouse position for aiming
        this.mousePos = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
        
        // Tiles
        this.tiles = [];
        this.tileWidth = 50;
        this.tileHeight = 30;
        this.tileRows = Math.floor((this.canvas.height - 100) / this.tileHeight);
        this.tileCols = Math.floor(this.canvas.width / this.tileWidth);
        
        // Safe zone for ball spawning (4 tiles from bottom)
        this.safeZoneHeight = 4 * this.tileHeight;
    }
    
    init() {
        this.addNewTileRow();
        this.updateUI();
    }
    
    getEmptyTilePosition() {
        const occupiedPositions = new Set();
        this.tiles.forEach(tile => {
            occupiedPositions.add(`${Math.floor(tile.x/this.tileWidth)},${Math.floor(tile.y/this.tileHeight)}`);
        });
        
        const possiblePositions = [];
        // Only consider positions above the safe zone
        const maxRow = Math.floor((this.canvas.height - this.safeZoneHeight) / this.tileHeight);
        
        for(let row = 0; row < maxRow; row++) {
            for(let col = 0; col < this.tileCols; col++) {
                if(!occupiedPositions.has(`${col},${row}`)) {
                    possiblePositions.push({x: col * this.tileWidth, y: row * this.tileHeight});
                }
            }
        }
        
        if(possiblePositions.length === 0) return null;
        return possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
    }
    
    addNewTileRow() {
        const newRow = [];
        for (let col = 0; col < this.tileCols; col++) {
            if (Math.random() < 0.3) {
                let hits = this.totalBalls + 1;
                if (Math.random() < 0.25) {
                    hits *= 2;
                }
                
                newRow.push({
                    x: col * this.tileWidth,
                    y: 0,
                    width: this.tileWidth,
                    height: this.tileHeight,
                    hits: hits,
                    color: '#000',
                    type: 'normal'
                });
            }
        }
        
        this.tiles.forEach(tile => {
            tile.y += this.tileHeight;
            // Check for game over
            if (tile.y + tile.height >= this.canvas.height - 50) {
                this.handleGameOver();
            }
        });
        
        this.tiles = [...newRow, ...this.tiles];
        this.tiles = this.tiles.filter(tile => tile.y < this.canvas.height - 50);
        
        // Add ball tile with 60% chance
        if (Math.random() < 0.6) {
            const emptyPos = this.getEmptyTilePosition();
            if(emptyPos) {
                this.tiles.push({
                    x: emptyPos.x,
                    y: emptyPos.y,
                    width: this.tileWidth,
                    height: this.tileHeight,
                    hits: 1,
                    type: 'ball'
                });
            }
        }
    }
    
    handleGameOver() {
        if (!this.gameOver) {
            this.gameOver = true;
            this.isPlaying = false;
            document.getElementById('finalLevel').textContent = this.level;
            document.getElementById('gameOver').style.display = 'flex';
        }
    }
    
    handleClick(event) {
        if (this.remainingBalls > 0 && !this.isPlaying && !this.gameOver) {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;
            
            const angle = Math.atan2(clickY - this.fixedBallPos.y, clickX - this.fixedBallPos.x);
            this.launchAngle = angle;
            this.isPlaying = true;
            this.ballsInPlay = 0;
            this.lastBallLaunchTime = 0;
            this.nextRoundStartX = null;
            this.isSpeedUp = false;
            this.ballSpeed = this.normalSpeed;
        }
    }
    
    launchBall() {
        const vx = Math.cos(this.launchAngle) * this.ballSpeed;
        const vy = Math.sin(this.launchAngle) * this.ballSpeed;
        
        this.balls.push({
            x: this.fixedBallPos.x,
            y: this.fixedBallPos.y,
            vx: vx,
            vy: vy,
            radius: this.ballRadius,
            lastHitTile: null
        });
        
        this.remainingBalls--;
        this.ballsInPlay++;
    }
    
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = event.clientX - rect.left;
        this.mousePos.y = event.clientY - rect.top;
    }
    
    updateBalls() {
        if (this.isPlaying && this.remainingBalls > 0) {
            const currentTime = Date.now();
            if (currentTime - this.lastBallLaunchTime >= this.ballLaunchDelay) {
                this.launchBall();
                this.lastBallLaunchTime = currentTime;
            }
        }
        
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            
            // Update position
            const nextX = ball.x + ball.vx;
            const nextY = ball.y + ball.vy;
            
            // Side wall collisions
            if (nextX - ball.radius < 0) {
                ball.vx = Math.abs(ball.vx);
                ball.x = ball.radius;
                ball.lastHitTile = null; // Reset after wall collision
            } else if (nextX + ball.radius > this.canvas.width) {
                ball.vx = -Math.abs(ball.vx);
                ball.x = this.canvas.width - ball.radius;
                ball.lastHitTile = null; // Reset after wall collision
            } else {
                ball.x = nextX;
            }
            
            // Top wall collision only
            if (nextY - ball.radius < 0) {
                ball.vy = Math.abs(ball.vy);
                ball.y = ball.radius;
                ball.lastHitTile = null; // Reset after wall collision
            } else {
                ball.y = nextY;
            }
            
            // Ball exits bottom - no bounce, just remove
            if (ball.y > this.canvas.height) {
                if (this.nextRoundStartX === null) {
                    this.nextRoundStartX = ball.x;
                }
                this.balls.splice(i, 1);
                this.ballsInPlay--;
                continue;
            }
            
            // Tile collisions
            for (let j = this.tiles.length - 1; j >= 0; j--) {
                const tile = this.tiles[j];
                if (this.checkCollision(ball, tile) && ball.lastHitTile !== tile) {
                    if (tile.type === 'ball') {
                        this.nextRoundExtraBalls++;
                        this.tiles.splice(j, 1);
                        this.updateUI();
                        continue;
                    }
                    
                    // Determine collision side and adjust position and velocity
                    const ballCenterX = ball.x;
                    const ballCenterY = ball.y;
                    const tileCenterX = tile.x + tile.width / 2;
                    const tileCenterY = tile.y + tile.height / 2;
                    
                    // Calculate collision angle
                    const dx = ballCenterX - tileCenterX;
                    const dy = ballCenterY - tileCenterY;
                    
                    // Determine if collision is more horizontal or vertical
                    if (Math.abs(dx) * tile.height > Math.abs(dy) * tile.width) {
                        // Horizontal collision
                        ball.vx = dx > 0 ? Math.abs(ball.vx) : -Math.abs(ball.vx);
                        ball.x = dx > 0 ? tile.x + tile.width + ball.radius : tile.x - ball.radius;
                    } else {
                        // Vertical collision
                        ball.vy = dy > 0 ? Math.abs(ball.vy) : -Math.abs(ball.vy);
                        ball.y = dy > 0 ? tile.y + tile.height + ball.radius : tile.y - ball.radius;
                    }
                    
                    // Mark tile as hit after bounce calculation
                    ball.lastHitTile = tile;
                    tile.hits--;
                    if (tile.hits <= 0) {
                        this.tiles.splice(j, 1);
                    }
                }
            }
        }
        
        if (this.isPlaying && this.balls.length === 0 && this.remainingBalls === 0) {
            this.endRound();
        }
    }
    
    checkCollision(ball, tile) {
        // Simple AABB collision check with circle
        const closestX = Math.max(tile.x, Math.min(ball.x, tile.x + tile.width));
        const closestY = Math.max(tile.y, Math.min(ball.y, tile.y + tile.height));
        
        const distanceX = ball.x - closestX;
        const distanceY = ball.y - closestY;
        
        return (distanceX * distanceX + distanceY * distanceY) < (ball.radius * ball.radius);
    }
    
    endRound() {
        if (!this.gameOver) {
            this.isPlaying = false;
            this.level++;
            this.totalBalls += this.nextRoundExtraBalls;
            this.remainingBalls = this.totalBalls;
            this.nextRoundExtraBalls = 0;
            
            if (this.nextRoundStartX !== null) {
                this.fixedBallPos.x = this.nextRoundStartX;
                this.nextRoundStartX = null;
            }
            
            this.addNewTileRow();
            this.updateUI();
        }
    }
    
    updateUI() {
        document.getElementById('level').textContent = `Level: ${this.level}`;
        document.getElementById('balls').textContent = `Balls: ${this.totalBalls + this.nextRoundExtraBalls}`;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.tiles.forEach(tile => {
            if (tile.type === 'ball') {
                this.ctx.beginPath();
                this.ctx.arc(
                    tile.x + tile.width/2,
                    tile.y + tile.height/2,
                    this.ballRadius * 1.5,
                    0,
                    Math.PI * 2
                );
                this.ctx.fillStyle = '#000';
                this.ctx.fill();
            } else {
                this.ctx.fillStyle = tile.color;
                this.ctx.fillRect(tile.x, tile.y, tile.width, tile.height);
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px "Space Mono"';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(tile.hits, tile.x + tile.width / 2, tile.y + tile.height / 2 + 4);
            }
        });
        
        if (!this.isPlaying && !this.gameOver) {
            this.ctx.beginPath();
            this.ctx.setLineDash([5, 5]);
            this.ctx.moveTo(this.fixedBallPos.x, this.fixedBallPos.y);
            this.ctx.lineTo(this.mousePos.x, this.mousePos.y);
            this.ctx.strokeStyle = '#000';
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
        
        this.ctx.fillStyle = '#000';
        this.balls.forEach(ball => {
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        if (!this.isPlaying && !this.gameOver) {
            this.ctx.beginPath();
            this.ctx.arc(this.fixedBallPos.x, this.fixedBallPos.y, this.ballRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#000';
            this.ctx.fill();
        }
    }
    
    gameLoop() {
        this.updateBalls();
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

window.onload = () => new Game();
