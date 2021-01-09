import { util } from "webpack";
import { setTextContentAndHash } from "../saveHash.dev";
import * as utils from "../util";

test("Should return textContentAndHash object", () => {
  const element = {
    currentTarget: {
      href: "http://somesite.com/path",
      textContent: "Mock Text",
    },
  };
  const response = setTextContentAndHash(element);

  expect(response).toHaveProperty("textContent", "Mock Text");
  expect(response).toHaveProperty("hash", "http://somesite.com/path");
});

test("Should return empty object", () => {
  const element = {
    currentTarget: {
      href: "http://somesite.com/path",
      textContent: "Mock Text",
    },
  };

  const spy = jest.spyOn(utils, "getFromStorage");
  const storageData = [
    { textContent: "Mock Text", hash: "http://somesite.com/path" },
  ];
  spy.mockReturnValue(JSON.stringify(storageData));

  const response = setTextContentAndHash(element);

  expect(response).not.toHaveProperty("textContent");
  expect(response).not.toHaveProperty("hash");
});
