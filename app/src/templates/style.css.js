const style = (data, theme) => `
    :root {
        --fg-color-1: ${theme === 'dark' ? data.colors[4] : data.colors[0]};
        --fg-color-2: ${theme === 'dark' ? data.colors[3] : data.colors[1]};
        --fg-color-3: ${data.colors[2]};
        --bg-color-2: ${theme === 'dark' ? data.colors[1] : data.colors[3]};
        --bg-color-1: ${theme === 'dark' ? data.colors[0] : data.colors[4]};
        --hero-img-filter: ${theme === 'dark'
            ? 'sepia(100%) hue-rotate(180deg) brightness(60%) contrast(120%)'
            : 'sepia(100%) hue-rotate(180deg) brightness(110%) contrast(80%)'
        };
    }
`;

export default {
    '-dark': (data) => style(data, 'dark'),
    '-light': (data) => style(data, 'light'),
}
