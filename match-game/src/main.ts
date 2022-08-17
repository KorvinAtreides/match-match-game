import constants from './constants';
import Database from './database';
import ElementCreator from './elementCreator';
import Form from './form';
import Game from './game';
import GameResult from './gameResult';
import GlobalSettings from './settings';

export default class Main {
  components: Array<HTMLElement>;

  constructor() {
    this.components = [];
  }

  createProject() {
    this.createHeader();
    const headerUl = document.querySelector('.header--ul');
    headerUl.children[0].classList.add('active');
    this.createAboutGamePage();
    this.createSettingsPage();
    const db = new Database();
    db.createDB();
    this.createScorePage();
  }

  createHeader() {
    const creator = new ElementCreator();
    const header = creator.appendNewElement(document.body, 'header', 'header');
    const logo = creator.appendNewElement(header, 'img', 'logo');
    logo.setAttribute('src', './icons/logo.png');
    const headerUl = creator.appendNewElement(header, 'ul', 'header--ul');
    const headerLi: Array<HTMLElement> = [];
    for (let i = 0; i < 3; i += 1) {
      headerLi.push(creator.appendNewElement(headerUl, 'li', 'header--li'));
    }
    for (let i = 0; i < headerLi.length; i += 1) {
      const li = headerLi[i];
      const img = creator.appendNewElement(li, 'img', 'header--img');
      switch (i) {
        case 0:
          img.setAttribute('src', './icons/header-about.png');
          li.innerHTML = `${img.outerHTML} About Game`;
          li.addEventListener('click', () => {
            const page = this.components.find((item) => item.className === 'about-game--wrapper');
            this.showPage(page, li);
          });
          break;
        case 1:
          img.setAttribute('src', './icons/header-score.png');
          li.innerHTML = `${img.outerHTML} Best Score`;
          li.addEventListener('click', () => {
            const page = this.components.find((item) => item.className === 'score--wrapper');
            this.showPage(page, li);
            Main.showScore();
          });
          break;
        case 2:
          img.setAttribute('src', './icons/header-settings.png');
          li.innerHTML = `${img.outerHTML} Game Settings`;
          li.addEventListener('click', () => {
            const page = this.components.find((item) => item.className === 'settings--wrapper');
            this.showPage(page, li);
          });
          break;
        default:
          break;
      }
    }
    const newUserButton = creator.appendNewElement(header, 'button', 'header--button');
    newUserButton.textContent = 'register new player';
    const form = new Form();
    newUserButton.onclick = () => {
      if (!document.querySelector('.aside-wrapper')) {
        form.createForm();
      } else {
        form.showForm();
      }
    };
  }

  createAboutGamePage() {
    const creator = new ElementCreator();
    const aboutGameWrapper = creator.appendNewElement(document.body, 'main', 'about-game--wrapper');
    const aboutGameTitle = creator.appendNewElement(aboutGameWrapper, 'h2', 'about-game--title');
    aboutGameTitle.textContent = 'How to play?';
    const ruleWrappers: Array<HTMLElement> = [];
    for (let i = 0; i < 3; i += 1) {
      ruleWrappers.push(
        creator.appendNewElement(aboutGameWrapper, 'div', 'about-game--rule-wrapper'),
      );
    }
    for (let i = 0; i < ruleWrappers.length; i += 1) {
      const gameRule = creator.appendNewElement(ruleWrappers[i], 'div', 'about-game--rule');
      const gameRuleExample = creator.appendNewElement(ruleWrappers[i], 'div', 'about-game--rule');
      gameRuleExample.classList.add('example');
      const gameRuleText = creator.appendNewElement(gameRule, 'p', 'about-game--text');
      const ruleExampleImg = creator.appendNewElement(gameRuleExample, 'img', 'rule--img');
      switch (i) {
        case 0:
          gameRuleText.textContent = '1) Register as new player in game';
          ruleExampleImg.setAttribute('src', './img/example-form.png');
          break;
        case 1:
          gameRuleText.textContent = '2) Configure your game settings';
          ruleExampleImg.setAttribute('src', './img/example-settings.png');
          break;
        case 2:
          gameRuleText.innerHTML = `
            3) Start new game! 
            <br>
            <br>
            Remember card positions and match it before times up.
          `;
          ruleExampleImg.setAttribute('src', './img/example-game.png');
          break;
        default:
          break;
      }
    }
    this.components.push(aboutGameWrapper);
  }

  createSettingsPage() {
    const creator = new ElementCreator();
    const settingsWrapper = creator.appendNewElement(document.body, 'main', 'settings--wrapper');
    settingsWrapper.remove();
    const settingsTitle = creator.appendNewElement(settingsWrapper, 'h2', 'settings--title');
    settingsTitle.textContent = 'Settings:';
    const settingsCardSubtitle = creator.appendNewElement(
      settingsWrapper,
      'h4',
      'settings--subtitle',
    );
    settingsCardSubtitle.textContent = 'Game Cards';
    const cardSelection: HTMLSelectElement = document.createElement('select');
    cardSelection.classList.add('settings--select');
    cardSelection.innerHTML = `  
      <option value="Signs" disabled selected>Select game card type</option>
      <option value="Birds">Birds</option>
      <option value="Dogs">Dogs</option>
      <option value="Airplans">Airplanes</option>
      <option value="Signs">Traffic Signs</option>
    `;
    settingsWrapper.append(cardSelection);
    const settingsDifficultySubtitle = creator.appendNewElement(
      settingsWrapper,
      'h4',
      'settings--subtitle',
    );
    settingsDifficultySubtitle.textContent = 'Difficulty';
    const difficultSelection: HTMLSelectElement = document.createElement('select');
    difficultSelection.classList.add('settings--select');
    difficultSelection.innerHTML = `  
      <option value="36" disabled selected>Select Difficulty</option>
      <option value="16">4x4</option>
      <option value="36">6x6</option>
      <option value="64">8x8</option>
    `;
    settingsWrapper.append(difficultSelection);
    GlobalSettings.setDefault(cardSelection.value, difficultSelection.value);
    [cardSelection, difficultSelection].forEach((select: HTMLSelectElement) => {
      select.addEventListener('input', () => {
        GlobalSettings.settings.type = cardSelection.value;
        GlobalSettings.settings.difficulty = difficultSelection.value;
      });
    });
    this.components.push(settingsWrapper);
  }

  showPage(activePage: HTMLElement, li: HTMLElement) {
    this.components.forEach((item) => item.remove());
    if (Game.gameIsCreated) {
      const headerButton: HTMLInputElement = document.querySelector('.header--button');
      headerButton.textContent = 'Start Game';
      document.querySelector('.game--wrapper').remove();
      Game.gameIsCreated = false;
      headerButton.onclick = () => {
        const game = new Game();
        game.startGame();
      };
    }
    document.querySelector('header').after(activePage);
    const headerLi: NodeListOf<HTMLElement> = document.querySelectorAll('.header--li');
    headerLi.forEach((item) => item.classList.remove('active'));
    li.classList.add('active');
  }

  createScorePage() {
    const creator = new ElementCreator();
    const scoreWrapper = creator.appendNewElement(document.body, 'main', 'score--wrapper');
    scoreWrapper.remove();
    const scoreTitle = creator.appendNewElement(scoreWrapper, 'h2', 'score--title');
    scoreTitle.textContent = `Best ${constants.countBestPlayers} Players: `;
    creator.appendNewElement(scoreWrapper, 'ul', 'score--ul');
    this.components.push(scoreWrapper);
  }

  static async showScore() {
    const creator = new ElementCreator();
    const db = new Database();
    const dataGames = await db.getMatchesDB();
    dataGames
      .sort((game1: GameResult, game2: GameResult) => {
        const score1 = Number(game1.score);
        const score2 = Number(game2.score);
        return score1 - score2;
      })
      .reverse();
    const scoreUl = document.querySelector('.score--ul');
    scoreUl.innerHTML = '';
    const theBestPlayers = dataGames.slice(0, constants.countBestPlayers);
    theBestPlayers.forEach((match: GameResult) => {
      const li = creator.appendNewElement(scoreUl, 'li', 'score--li');
      const scoreInfoWrapper = creator.appendNewElement(li, 'div', 'score--info-wrapper');
      const avatar: HTMLElement = creator.appendNewElement(
        scoreInfoWrapper,
        'div',
        'score--avatar',
      );
      avatar.style.setProperty('background-image', `url(${match.avatarUrl})`);
      const pWrapper = creator.appendNewElement(scoreInfoWrapper, 'div', 'score--p-wrapper');
      const pName = creator.appendNewElement(pWrapper, 'div', 'score--name');
      pName.textContent = `${match.firstName} ${match.lastName}`;
      const pEmail = creator.appendNewElement(pWrapper, 'div', 'score--email');
      pEmail.textContent = `${match.email}`;
      const scoreSpan = creator.appendNewElement(li, 'span', 'score--span');
      scoreSpan.textContent = `Score: ${match.score}`;
    });
  }
}
