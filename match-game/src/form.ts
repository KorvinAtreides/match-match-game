import ElementCreator from './elementCreator';
import User from './user';
import Database from './database';
import convertAvatarsDb from './shared';
import Game from './game';
import constants from './constants';

function displayDataValidity(input: HTMLElement, valid: Boolean) {
  const validityImage = input.nextElementSibling;
  validityImage.classList.remove('invisible');
  validityImage.setAttribute('src', `./icons/validation-${valid ? 'yes' : 'not'}.png`);
}

function displayValidityButton(submitFormButton: HTMLElement, valid: Boolean) {
  if (valid) {
    submitFormButton.classList.remove('invalid');
    submitFormButton.removeAttribute('title');
  } else {
    submitFormButton.classList.add('invalid');
    submitFormButton.setAttribute('title', 'Please, enter the valid data.');
  }
}

export default class Form {
  validity: boolean;

  specialSymbols: Array<string>;

  components: Array<HTMLInputElement>;

  formItself: HTMLElement;

  newUser: boolean;

  constructor() {
    this.validity = false;
    this.specialSymbols = [
      '~',
      '!',
      '@',
      '#',
      '$',
      '%',
      '*',
      '(',
      ')',
      '_',
      '—',
      '+',
      '=',
      '|',
      ':',
      ';',
      '"',
      "'",
      '`',
      '<',
      '>',
      ',',
      '.',
      '?',
      '/',
      '^',
    ];
    this.components = [];
    this.newUser = true;
  }

  createForm() {
    const creator = new ElementCreator();
    const aside = creator.appendNewElement(document.body, 'aside', 'aside-wrapper');
    aside.classList.add('invisible');
    creator.appendNewElement(aside, 'div', 'form-back');
    this.formItself = creator.appendNewElement(aside, 'form', 'user-form');
    this.formItself.style.transform = 'scale(0.3)';
    const userFormTitle = creator.appendNewElement(this.formItself, 'h3', 'user-form--title');
    userFormTitle.textContent = 'Register new Player';
    const inputWrapper = creator.appendNewElement(
      this.formItself,
      'div',
      'user-form--input-wrapper',
    );
    const avatarWrapper = creator.appendNewElement(
      this.formItself,
      'div',
      'user-form--avatar-wrapper',
    );
    const userAvatar = creator.appendNewElement(avatarWrapper, 'img', 'user-form--avatar');
    userAvatar.setAttribute('src', './icons/empty-face.png');
    const avatarInput: HTMLInputElement = document.createElement('input');
    avatarInput.classList.add('user-form--avatar-input');
    avatarInput.setAttribute('type', 'file');
    avatarInput.setAttribute('title', 'Load picture');
    avatarWrapper.append(avatarInput);
    avatarInput.addEventListener('input', () => {
      Form.createAvatar(avatarInput);
    });
    const labelFirstName = creator.appendNewElement(inputWrapper, 'label', 'user-form--label');
    labelFirstName.textContent = 'First Name:';
    const inputFirstName = creator.appendNewElement(labelFirstName, 'input', 'user-form--input');
    const labelLastName = creator.appendNewElement(inputWrapper, 'label', 'user-form--label');
    labelLastName.textContent = 'Last Name:';
    const inputLastName = creator.appendNewElement(labelLastName, 'input', 'user-form--input');
    const labelEmail = creator.appendNewElement(inputWrapper, 'label', 'user-form--label');
    labelEmail.textContent = 'Email:';
    const inputEmail = creator.appendNewElement(labelEmail, 'input', 'user-form--input');
    inputEmail.setAttribute('data-type', 'email');
    [inputFirstName, inputLastName, inputEmail].forEach((input: HTMLInputElement) => {
      this.components.push(input);
    });
    this.setValidation();
    [labelFirstName, labelLastName, labelEmail].forEach((label) => {
      const validationImage = creator.appendNewElement(label, 'img', 'user-form--validation-img');
      validationImage.setAttribute('src', './icons/validation-not.png');
      validationImage.classList.add('invisible');
    });
    const buttonWrapper = creator.appendNewElement(
      this.formItself,
      'div',
      'user-form--button-wrapper',
    );
    const changeButton = creator.appendNewElement(buttonWrapper, 'button', 'user-form--button');
    changeButton.textContent = 'To Log in';
    const submitFormButton = creator.appendNewElement(buttonWrapper, 'button', 'user-form--button');
    submitFormButton.textContent = 'Add user';
    const cancelFormButton = creator.appendNewElement(buttonWrapper, 'button', 'user-form--button');
    cancelFormButton.textContent = 'Cancel';
    [changeButton, submitFormButton, cancelFormButton].forEach((item) => {
      item.setAttribute('type', 'button');
    });
    changeButton.addEventListener('click', () => {
      this.newUser = !this.newUser;
      this.changeFormType();
    });
    submitFormButton.addEventListener('click', () => {
      this.validity = this.validateForm();
      if (this.validity) {
        this.submitForm();
      }
    });
    submitFormButton.addEventListener('mouseenter', () => {
      this.validity = this.validateForm();
      displayValidityButton(submitFormButton, this.validity);
    });
    cancelFormButton.addEventListener('click', () => {
      this.hideForm();
    });
    this.showForm();
  }

  changeFormType() {
    const formButtons: NodeListOf<HTMLElement> = document.querySelectorAll('.user-form--button');
    const userFormTitle = document.querySelector('.user-form--title');
    if (this.newUser) {
      formButtons[0].textContent = 'To Log in';
      formButtons[1].textContent = 'Add user';
      userFormTitle.textContent = 'Register new Player';
      this.formItself.classList.remove('log-in');
    } else {
      formButtons[0].textContent = 'To Register';
      formButtons[1].textContent = 'Log In';
      userFormTitle.textContent = 'Authorization';
      this.formItself.classList.add('log-in');
    }
  }

  showForm() {
    const aside: HTMLElement = document.querySelector('.aside-wrapper');
    this.formItself.style.transform = 'scale(0.3)';
    aside.classList.remove('invisible');
    document.body.classList.add('notScrollable');
    setTimeout(() => {
      this.formItself.style.transform = 'scale(1)';
    }, constants.instantDelay);
  }

  hideForm() {
    const aside: HTMLElement = document.querySelector('.aside-wrapper');
    this.formItself.style.transform = 'scale(0.3)';
    setTimeout(() => {
      aside.classList.add('invisible');
      document.querySelector('body').classList.remove('notScrollable');
      this.clearForm();
    }, constants.shortDelay);
  }

  setValidation() {
    this.components.forEach((input: HTMLInputElement) => {
      input.setAttribute('required', 'required');
      let regExp: RegExp;
      if (input.dataset.type !== 'email') {
        regExp = /\p{L}+([0-9 ]{0,}\p{L}{0,})*$/;
        input.setAttribute('data-type', 'name');
      } else {
        const regPart1 = /^(([^<>()[\].,;:\s@"]+(.[^<>()[\].,;:\s@"]+))|(".+"))/;
        const regPart2 = /@(([0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3})|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/;
        regExp = new RegExp(`${regPart1.source}${regPart2.source}`);
      }
      input.setAttribute('data-regexp', regExp.toString().slice(1, -1));
      input.setAttribute('maxlength', '30');
      input.addEventListener('input', () => displayDataValidity(input, this.validateInput(input)));
    });
  }

  validateForm() {
    let numberFalse = 0;
    this.components.forEach((input: HTMLInputElement) => {
      numberFalse += 1 - Number(this.validateInput(input));
      displayDataValidity(input, this.validateInput(input));
    });
    return !numberFalse;
  }

  validateInput(input: HTMLInputElement) {
    const arrSymbols: Array<string> = this.specialSymbols;
    if (input.dataset.type === 'name') {
      input.removeAttribute('title');
      const valueNotIncludesSymbols = arrSymbols.every((symbol) => !input.value.includes(symbol));
      if (!valueNotIncludesSymbols) {
        input.setAttribute('title', 'Name should not includes special symbols');
        return false;
      }
    }
    const regExp = new RegExp(input.dataset.regexp, 'ugi');
    regExp.lastIndex = 0;
    return input.validity.valid && regExp.test(input.value);
  }

  clearForm() {
    this.components.forEach((input: HTMLInputElement) => {
      const copyInput = input;
      copyInput.value = '';
      const validityImage = input.nextElementSibling;
      validityImage.classList.add('invisible');
    });
    const userAvatar = document.querySelector('.user-form--avatar');
    userAvatar.setAttribute('src', './icons/empty-face.png');
  }

  static createAvatar(input: HTMLInputElement) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function onload() {
      const img = new Image();
      img.setAttribute('src', String(reader.result));
      const currentImage = document.querySelector('.user-form--avatar');
      currentImage.classList.remove('user-form--avatar');
      currentImage.replaceWith(img);
      img.classList.add('user-form--avatar');
    };
    reader.readAsDataURL(file);
    const copyInput = input;
    copyInput.value = '';
  }

  async submitForm() {
    const arrayValue: Array<string> = [];
    this.components.forEach((input: HTMLInputElement) => arrayValue.push(input.value));
    const currentImage: HTMLImageElement = document.querySelector('.user-form--avatar');
    const imageUrl: string = await convertAvatarsDb(currentImage.src);
    const user = new User(arrayValue[0], arrayValue[1], arrayValue[2], imageUrl);
    const db = new Database();
    const checked = await db.checkUser(user.hash);
    if (this.newUser) {
      if (checked) {
        this.errorForm('This user already exists!!');
        return;
      }
      db.add(user, 'users');
    } else {
      if (!checked) {
        this.errorForm('Wrong Name or Email!!');
        return;
      }
      user.avatar = checked.avatar;
    }
    this.deleteForm();
    User.currentUser = user;
    Form.displayCurrentUser();
  }

  errorForm(title: string) {
    this.hideForm();
    setTimeout(() => {
      this.showForm();
      const userFormTitle = document.querySelector('.user-form--title');
      userFormTitle.innerHTML = title;
    }, constants.standardDelay);
  }

  deleteForm() {
    this.hideForm();
    setTimeout(() => {
      document.querySelector('.aside-wrapper').remove();
    }, constants.longDelay);
  }

  static displayCurrentUser() {
    const headerButton: HTMLButtonElement = document.querySelector('.header--button');
    headerButton.textContent = 'Start Game';
    headerButton.onclick = () => {
      const game = new Game();
      game.startGame();
    };
    const creator = new ElementCreator();
    const header = document.querySelector('header');
    const avatar = creator.appendNewElement(header, 'div', 'header--avatar');
    avatar.style.setProperty('background-image', `url(${User.currentUser.avatar})`);
    headerButton.after(avatar);
    const wrapperAvatar = creator.appendNewElement(header, 'div', 'header--wrapper-avatar');
    wrapperAvatar.append(headerButton, avatar);
  }
}
