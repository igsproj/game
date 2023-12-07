export function isValidStr(str) {
  return (typeof(str) === "string" && str.length > 0);
}

export function isError(res) {
  return (typeof(res) == "object" && res.constructor.name == "Error");
}

export function prepareString(value, strTrim, strCase) {
  if (!isValidStr(value))
    return value;

  let res = value;
  if (strTrim)
    res = res.trim();

  if (strCase == "lower")
    res = res.toLowerCase();

  if (strCase == "upper")
    res = res.toUpperCase();

  return res;
}

export function isValueInArr(val, arr, strTrim = true, strCase = "lower") {
  for (let i = 0; i < arr.length; ++i)
    if (prepareString(arr[i], strTrim, strCase) === prepareString(val, strTrim, strCase)) // Если значения строки, можно передать strTrim, strCase. Если не строки, то будут сравниваться значения без преобразований
      return i;

  return -1;
}

export function domCreateElem(appendTo, setObj, extInnerText) {
  if (!isValidStr(setObj.itemType))
    return;

  let elem = document.createElement(setObj.itemType);

  if (setObj.innerText)
    elem.innerText = setObj.innerText;

  if (extInnerText)
    elem.innerText = extInnerText;

  if (isValidStr(setObj.styleClass)) // установка классов
    elem.classList = setObj.styleClass;

  if (setObj.attrObj)
    for (let key in setObj.attrObj) // установка аттрибутов
      elem.setAttribute(key, setObj.attrObj[key]);

  if (isValidStr(setObj.appendFunc)) // вызов функции создания
    appendTo[setObj.appendFunc](elem);
  else
    appendTo.append(elem); // по умолчанию

  return elem;
}

function exchangeArrElems(arr, i1, i2) {
  let saved = arr[i1];
  arr[i1] = arr[i2];
  arr[i2] = saved;
}

export function getRandomFromTo(val1, val2) { // для положительных чисел
  const min = Math.min(val1, val2);
  const max = Math.max(val1, val2);

  return min +  Math.round(Math.random() * (max - min)); // 1 вариант с округлением
  // return min + Math.trunc(Math.random() * (max - min + 1)); // 2 вариант с trunc
}

export function mixArray(arr, onlyUniqIndex = true, changeToNewValue = true) { // TODO
  if (!Array.isArray(arr))
    return new Error("Ожидается массив !");

  if (arr.length === 2) {
    exchangeArrElems(arr, 0, 1);
    return;
  }

  for (let i = 0; i < arr.length; ++i) {
    let newIndex = getRandomFromTo(0, arr.length - 1);          // Math.round(Math.random() * (arr.length - 1));

    // проверка на тот же индекс чтобы не переставлять с собой
    if (newIndex === i) {
      if (onlyUniqIndex) // ищем новый индекс
        do
          newIndex = getRandomFromTo(0, arr.length - 1);
        while (newIndex === i)
      else
        continue; // нет смысла переставлять тот же элемент в любом случае
    }

    // значение такое же : либо искать новое, либо не переставлять
    if (arr[i] === arr[newIndex]) {
      if (changeToNewValue) // ищем новое значение
        do
          newIndex = getRandomFromTo(0, arr.length - 1);
        while (arr[i] === arr[newIndex])
      else
        continue; // нет смысла менять одинаковые значения
    }

    exchangeArrElems(arr, i, newIndex);
  }
}

export function isNumber(dig, fixed = false) {
  if (typeof(dig) != "number")
    return;

  if (fixed && (dig % 1 != 0))
    return false;

  return true;
}
