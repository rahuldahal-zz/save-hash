export function getFromStorage(hostAndPath) {
  return window.localStorage.getItem(`savedHash_${hostAndPath}`);
}
