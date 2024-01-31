export async function tryCatch(
  tryFunction,
  catchFunction,
  throwCondition = () => false,
) {
  let result;
  try {
    result = await tryFunction();
  } catch (e) {
    if (throwCondition(e)) {
      throw e;
    }

    if (catchFunction) {
      result = await catchFunction(e);
    }
  }

  return result;
}

export default tryCatch;
