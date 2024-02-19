const label = (data, dists, htmlElement) => {
  let tempLabel = data.labels.en;
  let value = htmlElement.attr("label-id");
  const keys = value.split(".");

  for (let i = 0; i < keys.length; i++) {
    if (tempLabel.hasOwnProperty(keys[i])) {
      tempLabel = tempLabel[keys[i]];

      if (i === keys.length - 1) {
        value = tempLabel;
      }
    } else {
      break;
    }
  }

  if (Array.isArray(value)) {
    value = value.join("");
  }

  return value;
};

export default label;
