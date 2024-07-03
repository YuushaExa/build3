class Menu {
    constructor() {
        this.menuElement = document.getElementById('menu');
        this.option1 = document.getElementById('option1');
        this.option2 = document.getElementById('option2');
        this.option3 = document.getElementById('option3');
        this.paused = false;

        this.option1.addEventListener('click', () => {
            player.enhanceBulletAttack();
            this.hide();
        });

        this.option2.addEventListener('click', () => {
            player.unlockVulcan();
            this.hide();
        });

        this.option3.addEventListener('click', () => {
            player.enhanceMaxHealth();
            this.hide();
        });
    }

    show() {
        this.menuElement.classList.add('active');
        this.paused = true;
    }

    hide() {
        this.menuElement.classList.remove('active');
        this.paused = false;
        requestAnimationFrame(gameLoop);
    }

    pauseGame() {
        this.paused = true;
    }

    resumeGame() {
        this.paused = false;
        requestAnimationFrame(gameLoop);
    }
}

export { Menu };
