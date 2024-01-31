export function tryCatch(
  tryFunction,
  catchFunction,
  throwCondition = () => false,
) {
  let result;

  try {
    result = tryFunction();
  } catch (e) {
    if (throwCondition(e)) {
      throw e;
    }

    if (catchFunction) {
      catchFunction(e);
    }
  }

  return result;
}

export default tryCatch;
