export const getTheming = () => {
  const colors = {
    grayscale: [
      "#000000",
      "#111111",
      "#222222",
      "#333333",
      "#CCCCCC",
      "#EEEEEE",
      "#F9F9F9",
      "#FFFFFF",
    ],
    accents: {
      architect: {
        light: "#c60f2d",
        dark: "#a50d26",
      },
      developer: {
        light: "#0083d6",
        dark: "#006db2",
      },
      leader: {
        light: "#00c9d6",
        dark: "#00a8b2",
      },
      teacher: {
        light: "#a68553",
        dark: "#8e7247",
      },
    },
  };

  const themes = [
    { name: "light", color: colors.grayscale[6] },
    { name: "dark", color: colors.grayscale[1] },
  ];

  return { colors, themes };
};
