import * as lib from "./lib.js"; // TODO

export class gameCards {

  constructor(rootDom, menuRoot, confirmRoot, themes, domObjects, bkgStyleClass, imgStyleClass) {
    this.rootDom = rootDom;
    this.menuRoot = menuRoot;
    this.confirmRoot = confirmRoot;
    this.themes = themes;
    this.domObjects = domObjects;
    this.showPairsInConsole = false;

    this.gameRoot = null;
    this.startTimer = null;

    this.bkgElems = document.querySelectorAll("."+bkgStyleClass);
    this.imgElem = document.querySelector("."+imgStyleClass);

    const search = new URLSearchParams(document.location.search);
    this.themeId = parseInt(search.get("theme"));
    if (Number.isNaN(this.themeId) || this.themeId < 0 || this.themeId >= this.themes.length)
      this.themeId = 0;

    this._initGameStatus();
    this._createSettingsMenu();
    this._createConfirm();
  }

  // получить случайные уникальные индексы начиная с 1 в количестве uniqCards из всего массива данной игры (всего карточек в игре cardsAmount)
  _getUniqCards() {
    let index = 0;
    const cards = [];
    do {
      if (this.uniqCards === this.curGame.cardsAmount) // выбраны все карты. нет смысла генерировать случайные числа
        cards.push(++index);
      else { // выбираем случайные карты для игры
        index = lib.getRandomFromTo(1, this.curGame.cardsAmount);

        if (!cards.find((elem) => elem === index))
          cards.push(index);
      }
    }
    while (cards.length < this.uniqCards)

    return cards;
  }

  _mixCards(cardsArr, premix = false, postMix = true) { // перемешать массив
    this.mixedPairs = [];

    for (let i = 0; i < this.openCardsNumber; ++i) { // клонируем cardsArr число раз = this.openCardsNumber
      const copy = cardsArr.slice(0);
      if (premix) // перемешать при добавлении
        lib.mixArray(copy);
      for (let value of copy) // добавить из копии в итоговый
        this.mixedPairs.push(value);
    }

    if (postMix)
      lib.mixArray(this.mixedPairs); // итоговое перемешивание
  }

  _addClick(index) {
    this.clicks.push({"index": index, "val": this.mixedPairs[index]});
  }

  _findInClicks(searchField, searchVal) {
    return this.clicks.find(elem => elem[searchField] === searchVal);
  }

  _hideGameField() {
    this.gameRoot.classList.add("hide");
  }

  _showGameField() {
    this.gameRoot.classList.remove("hide");
  }

  _createDom() { // рисуем Dom игры + обработчики событий
    if (!this.gameRoot)
      this.gameRoot = lib.domCreateElem(this.rootDom, this.domObjects.gameRoot); // создать новый контейнер для поля игры
    else
      this.images.forEach(elem => this.gameRoot.removeChild(elem.card)); // очистка карточек

    this.images = [];      // dom элементы li+img для карточки
    this._hideGameField(); // не будем показывать до загрузки всех картинок

    for (let i = 0; i < this.mixedPairs.length; ++i) {
      // элемент "li" отвечает за background
      const card = lib.domCreateElem(this.gameRoot, this.domObjects.card);
      card.classList.add(this.curGame.cardStyle); // Обратная сторона карточки (может быть разная для каждой игры)

      //  элемент "img" отвечает за картинку
      const cardName = this.curGame.dir.trim()+"card"+(this.mixedPairs[i])+"."+this.curGame.type.trim();
      this.domObjects.cardImg.attrObj = {"src": cardName}; // файл картинки карточки
      const img = lib.domCreateElem(card, this.domObjects.cardImg);
      img.classList.add(this.curGame.imgStyle);

      this.images.push({"img": img, "card": card}); // Запомнили dom элементы для img и card

      // Установка обработчиков
      img.addEventListener("load", (event) => { // обработчик на загрузку картинок. Показываем поле игры только если все загрузилось
        ++this.imgLoadCnt;

        if (this.imgLoadCnt === this.uniqCards * this.openCardsNumber) {
          this.onGameReady();
          this._setGrid(this.gridName, this.gridCellName, "add"); // установка сетки
          this._showGameField();
        }
      });

      // на случай ошибки загрузки картинки
      img.addEventListener("error", (event) => this.onImgLoadError(cardName));

      // не нужен drag-n-drop на картинке !
      img.addEventListener("dragstart", (event) => event.preventDefault());

      // обработчик клика на карточке
      card.addEventListener("click", (event) => {
        if (!this.gameBegin || this.gameOver) {
          this.onGameNotBegin();
          return;
        }

        if (this._checkIfOpened(i)) { // клик на уже открытых карточках - не нужно
          this.onOpenedCardClick(i);
          return;
        }

        if (this.clicks.length == 0) { // первый клик - начинаем поиск пары
          this._addClick(i);
          this._onClickCard(i);
          return;
        }

        if (this._findInClicks("index", i)) { // здесь уже кликали .. убираем выбор
          this._resetClicks();
          return;
        }

        this._onClickCard(i);
        if (!this._findInClicks("val", this.mixedPairs[i])) { // не та карточка
          this._onFailedClick(i);
          return;
        }

        ++this.clicksCnt;
        this._addClick(i); // это правильный клик

        if (this.clicksCnt === this.openCardsNumber - 1) { // открываем карточки
          this.openedCards.push(this.clicks); // будут нужны старые клики, чтобы знать что уже открыто
          this._openCards();
          this._resetClicks();
        }

        if (this.openedCards.length === this.uniqCards) // game over
          this._setGameOver();
      });
    }
  }

  _resetClicks() { // сброс выбора
    this._unselectAll();
    this.clicksCnt = 0;
    this.clicks = [];
  }

  _checkIfOpened(index) { // проверить была ли уже открыта эта карточка
    for (let click of this.openedCards)
      if (click.find(elem => elem.index === index))
        return true;
    return false;
  }

  _changeCardStyle(index, styleFunc, styleName, dest = "img") { // dest = "img" or "card"
    this.images[index][dest].classList[styleFunc](this.curGame[styleName]);
  }

  _openCloseCard(index, action) { // action = "open", "close"
    this._changeCardStyle(index, "remove", "cardOpenedStyle");
    this._changeCardStyle(index, "remove", "cardClosedStyle");

    if (action === "open")
      this._changeCardStyle(index, "add", "cardOpenedStyle");

    if (action === "close")
      this._changeCardStyle(index, "add", "cardClosedStyle");
  }

  _openCloseAllCards(action) {
    for (let i = 0; i < this.images.length; ++i)
      this._openCloseCard(i, action);
  }

  _initGameStatus() {
    this.gameOver = true;
    this.gameBegin = false;
  }

  _setGameOver() {
    this._initGameStatus();
    this.onEndGame();
  }

  _onClickCard(index) {
    this._changeCardStyle(index, "add", "cardSelectStyle", "card");
  }

  _onFailedClick(index) {
    this._changeCardStyle(index, "toggle", "cardNotPairStyle", "card");
    setTimeout(() => this._changeCardStyle(index, "remove", "cardSelectStyle", "card"), 1000);
    setTimeout(() => this._changeCardStyle(index, "toggle", "cardNotPairStyle", "card"), 1000);
  }

  _unselectAll() {
    this.clicks.forEach(elem => this._changeCardStyle(elem.index, "remove", "cardSelectStyle", "card")); // убрать рамки у текущего выбора
  }

  _selectOpenCards() {
    this.openedCards.forEach(
      elem => elem.forEach(card => this._changeCardStyle(card.index, "add", "cardRightSelectStyle", "card"))); // пометить все открытые карточки
  }

  _openCards() {
    this.clicks.forEach(elem => this._openCloseCard(elem.index, "open"));
  }

  _setGrid(gridName, cellName, func) {
    this.gameRoot.classList[func](gridName);
    this.images.forEach(elem => elem.card.classList[func](cellName));
  }

  _beginGame() {
    if (!this.prepared)
      return;

    this.gameBegin = true;
    this.onBeginGame();
    this._openCloseAllCards("close");
  }

  _prepareGame(gridName, gridCellName) {
    this.prepared = false;
    this.onPrepare();

    this.imgLoadCnt = 0; // счетчик загрузки картинок
    this.clicksCnt = 0; // сколько правильных кликов. Зависит от типа игры (this.openCardsNumber)
    this.clicks = [];   // последовательность кликов на карточках
    this.openedCards = []; // открытые карточки

    this.gridName = gridName; // сетка
    this.gridCellName = gridCellName;

    this.gameBegin = false;
    this.gameOver = false;

    this.curGame = this._getGame();
    this.uniqCards = this._getGameCards(); // uniqCards - сколько будем генерировать уникальных карточек. Если 2, то всего будет карточек 2*openCardsNumber
    this.openCardsNumber = this._getGameType(); // openCardsNumber определяет тип игры: 2 = игра в пары, 3 = игра в тройки и тд

    this._mixCards(this._getUniqCards());

    if (this.showPairsInConsole) {
      console.log("Подсказка : текущие пары");
      console.log(this.mixedPairs.toString());
    }

    this.prepared = true;
    this._createDom();
  }

  /****************************************************************************
  Создание меню
  *****************************************************************************/

  _createSelect(rootObj, srcObj, selectSrc, optionSrc, valField, label) {
    const options = {...optionSrc};
    const select = lib.domCreateElem(rootObj, selectSrc);
    for (let i = -1; i < srcObj.length; ++i) {
      if (i === -1) {
        if (label.length > 0) {
          let elem = srcObj[i + 1];
          options.innerText = label+" (*)";
          options.attrObj = {"value": valField ? elem[valField] : i + 1};
        }
        else
          continue;
      }
      else {
        let elem = srcObj[i];
        options.innerText = i === 0 ? elem.descr+"*" : elem.descr;
        options.attrObj = {"value": valField ? elem[valField] : i};
      }
      lib.domCreateElem(select, options);
    }
    return select;
  }

  _getSelectedValue(select) {
    return select ? parseInt(select.value) : 0;
  }

  _getTheme() {
    return this.themes[this._getSelectedValue(this.themeSelect)];
  }

  _getGame() {
    return this._getTheme().games[this._getSelectedValue(this.gameSelect)];
  }

  _getGameType() {
    return this._getSelectedValue(this.gameTypeSelect);
  }

  _getGameCards() {
    return this._getSelectedValue(this.gameCardsSelect);
  }

  _createCardsSelect() {
    let srcObj = [];
    for (let i = 2; i <= this._getGame().cardsAmount; ++i)
      srcObj.push({"descr": i, "val": i});
    return srcObj;
  }

  _removeSelect(select) {
    if (select)
      this.menuRoot.removeChild(select);
  }

  _refreshThemeSelect() {
    this._refreshGameSelect();
    this._refreshGameTypeSelect();
    this._refreshGameCardsSelect();
  }

  _refreshGameSelect() {
    this._removeSelect(this.gameSelect);
    this.gameSelect = this._createSelect(this.menuRoot, this._getTheme().games, this.domObjects.menuSelect, this.domObjects.menuOption, null, "Игра");
    this.gameSelect.addEventListener("change", () => this._refreshGameCardsSelect());
  }

  _refreshGameTypeSelect() {
    this._removeSelect(this.gameTypeSelect);
    this.gameTypeSelect = this._createSelect(this.menuRoot, this._getTheme().types, this.domObjects.menuSelect, this.domObjects.menuOption, "val", "Тип игры");
  }

  _refreshGameCardsSelect() {
    this._removeSelect(this.gameCardsSelect);
    this.gameCardsSelect = this._createSelect(this.menuRoot, this._createCardsSelect(), this.domObjects.menuSelect, this.domObjects.menuOption, "val", "Число карточек");
  }

  _createSettingsMenu() {
    this.themeSelect = this._createSelect(this.menuRoot, this.themes, this.domObjects.menuSelect, this.domObjects.menuOption, null, "");
    this.themeSelect.selectedIndex = this.themeId;
    this.prevThemeIndex = this.themeId;

    this._setTheme(this.themeId)
    this._refreshThemeSelect();
    this.themeSelect.addEventListener("change", () => this.onThemeChanged(this._getSelectedValue(this.themeSelect)));
  }

  /****************************************************************************
  Темы
  *****************************************************************************/

  _changeTheme(action, className) {
    this.bkgElems.forEach(elem => elem.classList[action](className));
  }

  _setTheme(newTheme) {
    const curTheme = this.themes[newTheme];
    this.imgElem.classList.add(curTheme.imgStyle);
    this._changeTheme("add", curTheme.bkgStyle);
  }

  /****************************************************************************
  Модальный диалог
  *****************************************************************************/

  _createConfirm() {
    lib.domCreateElem(this.confirmRoot, this.domObjects.confirmText);

    const btnWrap = lib.domCreateElem(this.confirmRoot, this.domObjects.confirmBtnWrap);
    this.confirmYes = lib.domCreateElem(btnWrap, this.domObjects.confirmYes);
    this.confirmNo = lib.domCreateElem(btnWrap, this.domObjects.confirmNo);

    this.confirmYes.addEventListener("click", () => this.onConfirmYes());
    this.confirmNo.addEventListener("click", () => this.onConfirmNo());
  }

  /****************************************************************************
  public api
  *****************************************************************************/

  isBegin() {
    return this.gameBegin;
  }

  isOver() {
    return this.gameOver;
  }

  onPrepare() {
    console.log("подготовка игры");
  }

  onGameReady() {
    console.log("все готово");
  }

  onBeginGame() {
    console.log("игра началась !");
  }

  onEndGame() {
    console.log("game over");
  }

  onGameNotBegin() {
    console.log("игра еще не началась !");
  }

  onOpenedCardClick(index) {
    // console.log("уже открыто = "+index);
  }

  onImgLoadError(cardName) {
    console.log("ошибка загрузки карточки : "+cardName);
  }

  onThemeChanged(themeId) {}

  getSelectedTheme() {
    return this._getSelectedValue(this.themeSelect);
  }

  onConfirmYes() {};

  onConfirmNo() {};

  resetTheme() {
     this.themeSelect.selectedIndex = this.prevThemeIndex;
  }

  changeGrid(gridClass, cellClass) {
    if (!this.gameRoot)
      return;

    this._hideGameField();
    this._setGrid(this.gridName, this.gridCellName, "remove");
    this.gridName = gridClass;
    this.gridCellName = cellClass;
    this._setGrid(this.gridName, this.gridCellName, "add");
    this._showGameField();
  }

  startGame(gridName, gridCellName, startDelay) {
    this._prepareGame(gridName, gridCellName);

    if (lib.isNumber(startDelay, true) && startDelay > 0)
      this.startTimer = setTimeout(() => {
        this._beginGame();
      }, startDelay);
  }

  stopGame() {
    clearTimeout(this.startTimer);
    this._setGameOver();
    this._unselectAll();
    this._openCloseAllCards("open");
    this._selectOpenCards();
  }

  enableHints() {
    this.showPairsInConsole = true;
  }
}

export class intervalTimer {

  constructor(delay, func) {
    this.delay = delay;
    this.cnt = 0;
    this.timerObj = null;
    this.func = func;
  }

  startTimer(maxTime) {
    this.maxTime = null;
    if (lib.isNumber(maxTime, true) && maxTime > 0)
      this.maxTime = maxTime;

    this.cnt = 0;
    this.onStartTimer();
    this.timerObj = setInterval(() => {
      if (this.maxTime !== null && this.cnt == this.maxTime) { // остановка по ограничению
        this.stopTimer();
        return;
      }
      this.func();
      ++this.cnt;
    }, this.delay);
  }

  stopTimer(runCb = true) {
    if (this.timerObj === null)
      return false;

    clearInterval(this.timerObj);
    this.timerObj = null;
    if (runCb)
      this.onStopTimer();

    return true;
  }

  getTimer() {
    return this.cnt;
  }

  onStopTimer() {}

  onStartTimer() {}
}
