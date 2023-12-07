const game1 = {
  "descr": "Цифры",
  "dir": "./img/games/funny-digits/",
  "type": "svg",
  "cardsAmount": 10,
  // стили
  "cardOpenedStyle": "card-opened-v1",
  "cardClosedStyle": "card-closed-v2",
  "cardStyle": "digits-card",
  "imgStyle": "no",
  "cardNotPairStyle": "card-notpair",
  "cardSelectStyle": "card-select-green",
  "cardRightSelectStyle": "card-select-right"
};

const game2 = {
  "descr": "Отпуск",
  "dir": "./img/games/holidays/",
  "type": "svg",
  "cardsAmount": 16,
  // стили
  "cardOpenedStyle": "card-opened-v1",
  "cardClosedStyle": "card-closed-v3",
  "cardStyle": "holidays-card",
  "imgStyle": "no",
  "cardNotPairStyle": "card-notpair",
  "cardSelectStyle": "card-select-green",
  "cardRightSelectStyle": "card-select-right"
};

const game3 = {
  "descr": "Покер",
  "dir": "./img/games/poker/",
  "type": "svg",
  "cardsAmount": 13,
  // стили
  "cardOpenedStyle": "card-opened-v1",
  "cardClosedStyle": "card-closed-v1",
  "cardStyle": "poker-card",
  "imgStyle": "poker-img",
  "cardNotPairStyle": "card-notpair",
  "cardSelectStyle": "card-select-red",
  "cardRightSelectStyle": "card-select-right"
};

const game4 = {
  "descr": "st. Patrick",
  "dir": "./img/games/patrick/",
  "type": "svg",
  "cardsAmount": 14,
  // стили
  "cardOpenedStyle": "card-opened-v1",
  "cardClosedStyle": "card-closed-v4",
  "cardStyle": "patrick-card",
  "imgStyle": "patrick-img",
  "cardNotPairStyle": "card-notpair-v2",
  "cardSelectStyle": "card-select-red",
  "cardRightSelectStyle": "card-select-right"
};

export const domObjects = {
  "gameRoot": {
    "itemType": "ul",
    "styleClass": "grid-row-auto list-reset game-field"
  },
  "card": {
    "itemType": "li",
    "styleClass": "card"
  },
  "cardImg": {
    "itemType": "img",
    "styleClass": "card-img"
  },
  "menuSelect": {
    "itemType": "select",
    "styleClass": "select"
  },
  "menuOption": {
    "itemType": "option",
    "styleClass": "option"
  },
  "confirmText": {
    "itemType": "span",
    "styleClass": "confirm-text",
    "innerText": "Остановить игру?"
  },
  "confirmYes": {
    "itemType": "button",
    "styleClass": "confirm-btn confirm-btn-yes",
    "innerText": "Да"
  },
  "confirmNo": {
    "itemType": "button",
    "styleClass": "confirm-btn confirm-btn-no",
    "innerText": "Нет"
  },
  "confirmBtnWrap": {
    "itemType": "div",
    "styleClass": "confirm-btn-wrap",
  }
};

const gameTypes1 = [
  {"descr": "Пары", "val": 2},
  {"descr": "Тройки", "val": 3},
  {"descr": "Четверки", "val": 4},
  {"descr": "Пятерки", "val": 5}
];

export const themes = [
  {
    "descr": "Карты",
    "imgStyle": "img-style-cards",
    "bkgStyle": "bkg-style-cards",
    "games": [game3, game4],
    "types": gameTypes1
  },
  {
    "descr": "Веселая",
    "imgStyle": "img-style-funny",
    "bkgStyle": "bkg-style-funny",
    "games": [game1, game2],
    "types": gameTypes1
  }
];
