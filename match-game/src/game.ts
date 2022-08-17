import constants from './constants';
import Database from './database';
import ElementCreator from './elementCreator';
import GlobalSettings from './settings';
import Timer from './timer';
import User from './user';

const DELAY_BEFORE_GAME_SECONDS = 30;
const ANIMATION_DELAY_SECONDS = 0.5;
const CANVAS_POSITION_TO_DRAW_TIMER = 90;

interface Statistics {
  allCards: number;
  allMatches: number;
  wrongMatches: number;
  time: number;
  userScore: number;
}

function shuffleArray(array: Array<number>) {
  const arr = array;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[j];
    arr[j] = arr[i];
    arr[i] = temp;
  }
  return arr;
}

function createArray(uniqueItems: number) {
  const arr: Array<number> = [];
  for (let i = 1; i < uniqueItems + 1; i += 1) {
    arr.push(i);
    arr.push(i);
  }
  return arr;
}

export default class Game {
  static gameIsCreated: boolean;

  waitingBeforeGame: number;

  waitingAnimation: number;

  clickedTargets: number;

  countMatches: number;

  countWrongMatches: number;

  targetsLeft: number;

  firstTarget: HTMLElement | null;

  score: number;

  statistic: Statistics;

  timer: Timer;

  constructor() {
    this.waitingBeforeGame = DELAY_BEFORE_GAME_SECONDS;
    this.waitingAnimation = ANIMATION_DELAY_SECONDS;
    this.clickedTargets = 0;
    this.countMatches = 0;
    this.countWrongMatches = 0;
    this.firstTarget = null;
  }

  startGame() {
    Game.gameIsCreated = false;
    document.querySelector('main').remove();
    const headerButton: HTMLButtonElement = document.querySelector('.header--button');
    headerButton.textContent = 'Stop Game';
    headerButton.onclick = () => {
      const aboutGameLink: HTMLElement = document.querySelector('.header--li');
      aboutGameLink.click();
    };
    const headerLi: NodeListOf<HTMLElement> = document.querySelectorAll('.header--li');
    headerLi.forEach((item) => item.classList.remove('active'));
    this.targetsLeft = Number(GlobalSettings.settings.difficulty);
    this.createField(GlobalSettings.settings.type, Number(GlobalSettings.settings.difficulty));
  }

  createField(type: string, itemsNumber: number) {
    const creator = new ElementCreator();
    const gameWrapper = creator.appendNewElement(document.body, 'main', 'game--wrapper');
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.classList.add('game--timer');
    gameWrapper.append(canvas);
    const gameFieldWrapper = creator.appendNewElement(gameWrapper, 'div', 'game--field-wrapper');
    gameFieldWrapper.style.setProperty(
      'grid-template-columns',
      `repeat( ${itemsNumber ** 0.5}, 100px)`,
    );
    const uniqueItemsNumber = itemsNumber / 2;
    const itemWrappers: Array<HTMLElement> = [];
    for (let i = 0; i < itemsNumber; i += 1) {
      itemWrappers.push(creator.appendNewElement(gameFieldWrapper, 'div', 'item-wrapper'));
    }
    const cardsArray = shuffleArray(createArray(uniqueItemsNumber));
    Game.displayCards(itemWrappers, cardsArray, type);
    Game.gameIsCreated = true;
    const timer = this.setTimer(canvas);
    this.timer = timer;
    this.beforeGame(itemWrappers);
    itemWrappers.forEach((item) => {
      const imageWrapper: HTMLElement = item.querySelector('.game--image-wrapper');
      imageWrapper.addEventListener('click', () => {
        this.clickInGame(item, timer.value);
      });
    });
  }

  static displayCards(itemWrappers: Array<HTMLElement>, cardsArray: Array<number>, type: string) {
    for (let count = 0; count < itemWrappers.length; count += 1) {
      const creator = new ElementCreator();
      const itemWrapper = itemWrappers[count];
      const imageWrapper = creator.appendNewElement(itemWrapper, 'div', 'game--image-wrapper');
      itemWrapper.setAttribute('data-number', `${cardsArray[count]}`);
      const backImage: HTMLElement = creator.appendNewElement(imageWrapper, 'img', 'item-img');
      backImage.setAttribute('src', './img/item-back.png');
      backImage.classList.add('item-back');
      backImage.style.setProperty('transform', 'rotateY(180deg)');
      const frontImage: HTMLElement = creator.appendNewElement(imageWrapper, 'img', 'item-img');
      frontImage.setAttribute(
        'src',
        `./img/game-items/${type}/${cardsArray[count] < 10 ? '0' : ''}${cardsArray[count]}.png`,
      );
      frontImage.classList.add('item-card');
      frontImage.style.setProperty('transform', 'rotateY(0deg)');
      imageWrapper.addEventListener('click', () => {
        Game.rotateCards(imageWrapper, true);
      });
    }
  }

  setTimer(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    const timer = new Timer(
      context,
      CANVAS_POSITION_TO_DRAW_TIMER,
      CANVAS_POSITION_TO_DRAW_TIMER,
      this.waitingBeforeGame,
    );
    setInterval(() => {
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      timer.tick();
    }, 1000);
    return timer;
  }

  beforeGame(itemWrappers: Array<HTMLElement>) {
    itemWrappers.forEach((item) => {
      const creator = new ElementCreator();
      const gameShield = creator.appendNewElement(item, 'div', 'shield');
      setTimeout(() => {
        gameShield.remove();
        const imageWrapper: HTMLElement = item.querySelector('.game--image-wrapper');
        Game.rotateCards(imageWrapper, true);
      }, (this.waitingBeforeGame + 1) * 1000);
    });
  }

  clickInGame(clickTarget: HTMLElement, currentTime: number) {
    const creator = new ElementCreator();
    const shield: HTMLElement = creator.appendNewElement(clickTarget, 'div', 'shield');
    this.clickedTargets += 1;
    if (this.clickedTargets === 2) {
      this.turnOnShields(clickTarget);
      const previousShield: HTMLElement = this.firstTarget.querySelector('.shield');
      const match = this.firstTarget.dataset.number === clickTarget.dataset.number;
      shield.style.setProperty('background-color', `${match ? 'green' : 'red'}`);
      previousShield.style.setProperty('background-color', `${match ? 'green' : 'red'}`);
      this.countMatches += 1;
      if (match) {
        this.targetsLeft -= 2;
        if (this.targetsLeft === 0) {
          this.endGame(currentTime);
        }
      } else {
        this.countWrongMatches += 1;
        setTimeout(() => {
          Game.rotateCards(clickTarget, false);
          Game.rotateCards(this.firstTarget, false);
        }, this.waitingAnimation * 1000);
        setTimeout(() => {
          shield.remove();
          previousShield.remove();
          shield.style.setProperty('background-color', 'transparent');
          previousShield.style.setProperty('background-color', 'transparent');
        }, this.waitingAnimation * 2 * 1000);
      }
      setTimeout(() => {
        this.clickedTargets = 0;
        this.firstTarget = null;
      }, this.waitingAnimation * 1000);
    } else {
      this.firstTarget = clickTarget;
    }
  }

  turnOnShields(clickTarget: HTMLElement) {
    const itemWrappers: NodeListOf<HTMLElement> = document.querySelectorAll('.item-wrapper');
    const creator = new ElementCreator();
    itemWrappers.forEach((item) => {
      if (item !== clickTarget && item !== this.firstTarget) {
        const shield: HTMLElement = creator.appendNewElement(item, 'div', 'shield');
        setTimeout(() => {
          shield.remove();
        }, this.waitingAnimation * 2 * 1000);
      }
    });
  }

  static rotateCards(imageWrapper: HTMLElement, directSequence: boolean) {
    const degrees: number = directSequence ? 180 : -180;
    const backImage: HTMLElement = imageWrapper.querySelector('.item-back');
    const frontImage: HTMLElement = imageWrapper.querySelector('.item-card');
    let currentTransform = Number(backImage.style.transform.slice(8, -4));
    backImage.style.setProperty('transform', `rotateY(${currentTransform + degrees}deg)`);
    currentTransform = Number(frontImage.style.transform.slice(8, -4));
    frontImage.style.setProperty('transform', `rotateY(${currentTransform + degrees}deg)`);
  }

  endGame(timeSec: number) {
    this.timer.stopped = true;
    const deltaMatches = this.countMatches - this.countWrongMatches;
    const fieldDimansion = (deltaMatches * 2) ** 0.5;
    let score = (deltaMatches * 100 - timeSec * 10) * fieldDimansion;
    score = score < 0 ? 0 : score;
    this.score = score;
    const statistics: Statistics = {
      allCards: deltaMatches * 2,
      allMatches: this.countMatches,
      wrongMatches: this.countWrongMatches,
      time: timeSec,
      userScore: score,
    };
    this.updateUser();
    this.statistic = statistics;
    this.showCongratulations();
  }

  updateUser() {
    const user = User.currentUser;
    const db = new Database();
    db.add(user, 'games', String(this.score));
  }

  showCongratulations() {
    const statistics = this.statistic;
    const creator = new ElementCreator();
    const aside = creator.appendNewElement(document.body, 'aside', 'aside-wrapper');
    aside.classList.add('invisible');
    creator.appendNewElement(aside, 'div', 'congrat--back');
    const congratFront = creator.appendNewElement(aside, 'form', 'congrat--front');
    congratFront.style.transform = 'scale(0.3)';
    const title = creator.appendNewElement(congratFront, 'h2', 'congrat--title');
    title.textContent = 'Congratulations!!!';
    const subtitle = creator.appendNewElement(congratFront, 'h2', 'congrat--subtitle');
    subtitle.textContent = 'Some Statistics:';
    const statWrapper = creator.appendNewElement(congratFront, 'ul', 'congrat--stat-wrapper');
    statWrapper.innerHTML = `
      <li>Your Name: <span>${User.currentUser.firstName} ${User.currentUser.lastName}</span></li>
      <li>All Cards: <span>${statistics.allCards}</span></li>
      <li>All Matches: <span>${statistics.allMatches}</span></li>
      <li>Wrong Matches: <span>${statistics.wrongMatches}</span></li>
      <li>Time: <span>${statistics.time} seconds</span></li>
      <li>Your Score: <span>${statistics.userScore}</span></li>
    `;
    const finishButton = creator.appendNewElement(congratFront, 'button', 'congrat--button');
    finishButton.setAttribute('type', 'button');
    finishButton.textContent = 'OK';
    aside.classList.remove('invisible');
    document.body.classList.add('notScrollable');
    setTimeout(() => {
      congratFront.style.transform = 'scale(1)';
    }, constants.instantDelay);
    finishButton.onclick = () => {
      congratFront.style.transform = 'scale(0.3)';
      setTimeout(() => {
        aside.classList.add('invisible');
        document.querySelector('body').classList.remove('notScrollable');
        aside.remove();
        const headerLinks: NodeListOf<HTMLElement> = document.querySelectorAll('.header--li');
        headerLinks[1].click();
      }, constants.shortDelay);
    };
  }
}
