import { getTextContent } from "../saveHash.dev.js";

test("Should get text content", () => {
  const ELEM_WITH_TEXT_CONTENT = {
    textContent: "text on itself",
  };
  const ELEM_WITH_TEXT_CONTENT_ON_PARENT = {
    parentElement: {
      textContent: "text on parent",
    },
  };
  const ELEM_WITH_NO_TEXT_CONTENT = {
    parentElement: {
      parentElement: {
        noTextContent: null;
      }
    }
  }

  expect(getTextContent(ELEM_WITH_TEXT_CONTENT)).toBe("text on itself");
  expect(getTextContent(ELEM_WITH_NO_TEXT_CONTENT)).toBe("No textContent found, rename this");
  expect(getTextContent(ELEM_WITH_TEXT_CONTENT_ON_PARENT)).toBe(
    "text on parent"
  );
});
