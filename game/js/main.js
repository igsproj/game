import { themes, domObjects } from "./settings.js";
import { gameCards, intervalTimer } from "./game.js";

/*********************************************************
helpers
*********************************************************/

function checkFoundDom(elem, descr) {
  if (!elem) {
    alert("Ошибка запуска !");
    throw new Error("Не найден элемент : "+descr);
  }
}

function addClassIfNotExist(elem, className) {
  if (!elem.classList.contains(className))
    elem.classList.add(className);
}

function secToTime(sec) {
  let secNum = parseInt(sec, 10);
  let hours   = Math.floor(secNum / 3600);
  let minutes = Math.floor((secNum - (hours * 3600)) / 60);
  let seconds = secNum - (hours * 3600) - (minutes * 60);

  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  return hours+':'+minutes+':'+seconds;
}

function showTimer(timer, val, clear = false) {
  timer.innerText = clear ? "00:00:00" : val;
};

function isValidTime(time, maxSec) {
  if (Number.isNaN(time) || time <= 0 || time > maxSec)
    return false;
  return true;
}

/*********************************************************
DOM
*********************************************************/

const rootDom = document.getElementById("game-field-id");
checkFoundDom(rootDom, "rootDom");

const menu = document.querySelector(".game-menu");
checkFoundDom(menu, "menu");

const startBtn = document.querySelector(".start-btn");
checkFoundDom(startBtn, "startBtn");

const info = document.getElementById("info-id");
checkFoundDom(info, "info");

const gridPlusBtn = document.querySelector(".grid-btn-plus");
checkFoundDom(gridPlusBtn, "gridPlusBtn");

const gridMinusBtn = document.querySelector(".grid-btn-minus");
checkFoundDom(gridMinusBtn, "gridMinusBtn");

const setBtn = document.querySelector(".set-btn");
checkFoundDom(setBtn, "set-btn");

const startTimerInput = document.getElementById("input-startdelay-id");
checkFoundDom(startTimerInput, "startTimerInput");

const endTimerInput = document.getElementById("input-endtime-id");
checkFoundDom(endTimerInput, "endTimerInput");

const gameRoot = document.querySelector(".game-root");
checkFoundDom(gameRoot, "game-root");

const spinner = document.querySelector(".lds-spinner");
checkFoundDom(spinner, "spinner");

const confirmRoot = document.querySelector(".confirm-dlg");
checkFoundDom(confirmRoot, "confirm-dlg");

setBtn.addEventListener("click", () => {
  menu.classList.toggle("hide");
  menu.classList.toggle("menu-active");
});

startTimerInput.addEventListener("change", () => {
  if (!isValidTime(startTimerInput.value, 300))
    startTimerInput.value = "";
});

endTimerInput.addEventListener("change", () => {
  if (!isValidTime(endTimerInput.value, 3600))
  endTimerInput.value = "";
});

/*********************************************************
Старт / стоп
*********************************************************/

startBtn.addEventListener("click", () => {
  if (game.isOver()) {
    showTimer(info, 0, true); // очистка

    let timeToPrepare = parseInt(startTimerInput.value); // время запомнить
    timeToPrepare = isValidTime(timeToPrepare, 300) ? timeToPrepare * 1000 : 5000;

    game.startGame("gr"+curGrid+"-grid", "gr"+curGrid+"-cell", timeToPrepare);
  }
  else
    if (!gameTimer.stopTimer()) // таймер игры еще не запущен (в процессе показа карточек) - останавливаем принудительно. Иначе если таймер работает, он остановит игру по gameTimer.onStopTimer
      game.stopGame();
});

/*********************************************************
Кнопки масштаба
*********************************************************/

function controlGridBtn() {
  addClassIfNotExist(gridPlusBtn, "grid-btn-active");
  addClassIfNotExist(gridMinusBtn, "grid-btn-active");

  let remove = null;
  if (curGrid == 1)
    remove = gridPlusBtn;

  if (curGrid == maxGrids)
    remove = gridMinusBtn;

  if (remove)
    remove.classList.remove("grid-btn-active");
}

gridPlusBtn.addEventListener("click", () => {
  if (!gridPlusBtn.classList.contains("grid-btn-active"))
    return;

  if (curGrid > 1) {
    --curGrid;
    game.changeGrid("gr"+curGrid+"-grid", "gr"+curGrid+"-cell");
  }
  controlGridBtn();
});

gridMinusBtn.addEventListener("click", () => {
  if (!gridMinusBtn.classList.contains("grid-btn-active"))
    return;

  if (curGrid < maxGrids) {
    ++curGrid;
    game.changeGrid("gr"+curGrid+"-grid", "gr"+curGrid+"-cell");
  }
  controlGridBtn();
});

/*********************************************************
Инициализация игры
*********************************************************/

const maxGrids = 6;
let curGrid = 4;
let maxTime = 0;

const gameTimer = new intervalTimer(1000, () => {
  let curTimer = gameTimer.getTimer();
  if (maxTime > 0)
    curTimer = maxTime - curTimer;
  showTimer(info, secToTime(curTimer));
});

const game = new gameCards(rootDom, menu, confirmRoot, themes, domObjects, "bkg-style", "game-img");
game.enableHints();
showTimer(info, 0, true); // очистка

gameTimer.onStopTimer = () => game.stopGame(); // авто остановка игры по интервалу maxTime
controlGridBtn();

info.innerText = "Настройте игру и начнем !";

/*********************************************************
Обработчики событий игры
*********************************************************/

game.onPrepare = () => {
  showTimer(info, 0, true); // очистка
  info.innerText = "Подготовка игры ..."
  startBtn.innerText = "СТОП";
  startBtn.classList.add("start-btn-stop");
};

game.onGameReady = () => {
  controlGridBtn();
  info.innerText = "Запомните карточки"
};

game.onBeginGame = () => {
  let endTime = parseInt(endTimerInput.value);
  maxTime = isValidTime(endTime, 3600) ? endTime : null;
  gameTimer.startTimer(maxTime);
  info.innerText = "Начали!";
};

game.onEndGame = ()  => {
  info.innerText = "GAME OVER !"
  startBtn.innerText = "СТАРТ";
  startBtn.classList.remove("start-btn-stop");
  gameTimer.stopTimer(false);
};

game.onConfirmYes = () => {
  confirmRoot.classList.toggle("hide");
  reloadGame(game.getSelectedTheme());
}

game.onConfirmNo = () => {
  game.resetTheme(); // вернуть выбор темы к предыдущей
  confirmRoot.classList.toggle("hide");
}

game.onThemeChanged = (themeId) => {
  if (!game.isOver())
    confirmRoot.classList.toggle("hide");
  else
    reloadGame(game.getSelectedTheme());
}

/*********************************************************
Обработчики загрузки страницы
*********************************************************/

function showLoadPage() {
  gameRoot.classList.toggle("display-none");
  spinner.classList.toggle("display-none");
}

function reloadGame(themeId) {
  window.location = "http://"+document.location.host+"/?theme="+themeId;
}

// страница загружена
window.addEventListener("load", () => showLoadPage());

// перезагрузка страницы
window.addEventListener("beforeunload", () => showLoadPage());

// document.addEventListener("readystatechange", (event) => {
//   console.log(`readystate: ${document.readyState}`);

//   if (document.readyState === "complete")
//     showLoadPage();
// });

// if (window.performance) {
//   console.info("window.performance works fine on this browser");
// }
// console.info(performance.navigation.type);
// if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
//   console.info( "This page is reloaded" );
// } else {
//   console.info( "This page is not reloaded");
// }

// document.addEventListener("error", () => {
//   console.log("error");
// });

// document.addEventListener("DOMContentLoaded", (event) => {
//   console.log(`DOMContentLoaded`);
// });

// window.addEventListener("load", console.log("load"));
