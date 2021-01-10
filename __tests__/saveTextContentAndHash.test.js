import { saveTextContentAndHash } from "../saveHash.dev";
import * as utils from "../util";

test("should return null for empty object", () => {
  expect(saveTextContentAndHash({})).toBe(null);
});

test("should save new data to local storage", () => {
  const spy = jest.spyOn(utils, "getFromStorage");
  const storageData = [
    { textContent: "Mock Text", hash: "http://somesite.com/path" },
  ];
  //   JSON.stringify(storageData)
  spy.mockReturnValue(null);

  // spy on localStorage

  jest.spyOn(window.localStorage.__proto__, "setItem");
  window.localStorage.__proto__.setItem = jest.fn();

  const response = saveTextContentAndHash(storageData[0]);

  expect(localStorage.setItem).toHaveBeenCalled();
  expect(response).toBe(JSON.stringify(storageData));
});

test("should save new data, taking old data into account", () => {
  const newData = {
    textContent: "Mock Text New",
    hash: "http://somesite.com/path",
  };
  const oldData = {
    textContent: "Mock Text Old",
    hash: "http://oldsite.com/path",
  };

  const spy = jest.spyOn(utils, "getFromStorage");
  spy.mockReturnValue(JSON.stringify([oldData]));

  // spy on localStorage

  jest.spyOn(window.localStorage.__proto__, "setItem");
  window.localStorage.__proto__.setItem = jest.fn();

  const response = saveTextContentAndHash(newData);

  expect(localStorage.setItem).toHaveBeenCalled();
  expect(response).toBe(JSON.stringify([oldData, newData]));
});
