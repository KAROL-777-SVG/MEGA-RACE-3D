/**
 * MainMenu — bosh menyu boshqaruvi va sahifalar orasida o'tish.
 */
export class MainMenu {
  constructor(game) {
    this.game = game;
    this.currentScreen = 'main-menu';
    this.bindButtons();
  }

  bindButtons() {
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        this.handleAction(action);
      });
    });
  }

  handleAction(action) {
    switch (action) {
      case 'play': this.game.startGame(); break;
      case 'garage': this.game.openGarage(); break;
      case 'settings': this.showScreen('settings-menu'); break;
      case 'controls': this.showScreen('controls-menu'); break;
      case 'menu': this.showScreen('main-menu'); this.game.state = 'menu'; break;
      case 'resume': this.game.resume(); break;
    }
  }

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    if (id) {
      const el = document.getElementById(id);
      if (el) el.classList.add('active');
    }
    this.currentScreen = id;
  }

  updateMoney(money) {
    const el = document.getElementById('menu-money');
    if (el) el.textContent = '$' + money.toLocaleString();
  }
}