window.addEventListener('load', function () {
    //canvas setup
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;

    // InputHandler class handles user input
    class InputHandler {
        constructor(game) {
            this.game = game;

            window.addEventListener('keydown', e => {
                if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && this.game.keys.indexOf(e.key) === -1) {
                    this.game.keys.push(e.key);
                } else if (e.key === ' ') {
                    this.game.player.shootTop();
                }

            });

            window.addEventListener('keyup', e => {
                const index = this.game.keys.indexOf(e.key);
                if (index > -1) {
                    this.game.keys.splice(index, 1);
                }

            });
        }
    }

    // Projectile class represents projectiles in the game
    class Projectile {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;
        }

        update() {
            this.x += this.speed;
            if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }

        draw(context) {
            context.fillStyle = 'yellow';
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    // Particle class represents particles in the game
    class Particle {
        // Implementation for Particle class (if needed)
    }

    // Player class represents the player character
    class Player {
        constructor(game) {
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.speedY = 0;
            this.maxSpeed = 3;
            this.projectiles = [];
        }

        update() { 
            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;

            // Handle projectiles
            this.projectiles.forEach(projectile => {
                projectile.update();
            });

            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
        }

        draw(context) {
            context.fillStyle = 'black';
            context.fillRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
        }

        shootTop() {
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 88, this.y + 30));
                this.game.ammo--;
            }

        }
    }

    // Enemy class represents enemy characters
    class Enemy {
        // Implementation for Enemy class (if needed)
        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
            this.lives = 5;
            this.score = this.lives;
        }
        update() {
            this.x += this.speedX;
            if (this.x + this.width < 0) this.markedForDeletion = true;
        }
        draw(context) {
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.fillStyle = 'black';
            context.font = '20px Helvetica'
            context.fillText(this.lives, this.x, this.y)
        }
    }


    class Anguler extends Enemy {
        constructor(game) {
            super(game);
            this.width = 228 * 0.2;
            this.height = 169 * 0.2;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);

        }
    }

    // Layer class represents a layer in the game world
    class Layer {
        // Implementation for Layer class (if needed)
    }

    // Background class represents the background of the game
    class Background {
        // Implementation for Background class (if needed)
    }

    // UI class handles the user interface elements
    class UI {
        // Implementation for UI class (if needed)
        constructor(game) {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Helvetica';
            this.color = 'white';
        }

        draw(context) {
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontSize + 'px ' + this.fontFamily;            //score
            context.fillText('Score ' + this.game.score, 20, 40);

            // ammo
            context.fillStyle = this.color;
            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }

            // game over message
            if (this.game.gameOver) {
                context.textAlign = 'center';
                let message1;
                let message2;
                if (this.game.score >= this.game.winingScore) {  // Changed this line
                    message1 = "You Win!";
                    message2 = "You Done!";
                } else {
                    message1 = 'You Lost!';
                    message2 = 'Try again next time!';
                }

                context.font = '50px ' + this.fontFamily; // Fixed font concatenation
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5);

                context.font = '25px ' + this.fontFamily; // Fixed font concatenation
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5);

            }

            context.restore();
        }

    }

    // Game class represents the main game logic
    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.gameOver = false;
            this.winingScore = 15; // Changed this line
            this.score = 0;
        }

        update(deltaTime) {
            this.player.update();
            if (this.ammoTimer > this.ammoInterval) {
                if (this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }

            this.enemies.forEach(enemy => {
                enemy.update();
                if (this.checkCollision(this.player, enemy)) {
                    enemy.markedForDeletion = true;
                }
                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollision(projectile, enemy)) {
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                    }
                    if (enemy.lives <= 0) {
                        enemy.markedForDeletion = true;
                        this.score += enemy.score;
                        if (this.score >= this.winingScore) this.gameOver = true; // Changed this line
                    }
                })
            })
            
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion)
            if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
                this.addEnemy();
                this.enemyTimer = 0;
            }
            else {
                this.enemyTimer += deltaTime;
            }
        }

        draw(context) {
            this.player.draw(context);
            this.ui.draw(context)
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
        }
        addEnemy() {
            this.enemies.push(new Anguler(this));
            console.log(this.enemies)
        }
        checkCollision(rect1, rect2) {
            return (rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.height + rect1.y > rect2.y)
        }

    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    // Animation loop
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }

    animate(0);
});





