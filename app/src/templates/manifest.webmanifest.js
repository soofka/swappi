const manifest = (data, lang, theme) => {
    const color = theme === 'dark' ? data.colors[4] : data.colors[0];
    return JSON.stringify({
        name: data[lang].title,
        short_name: data[lang].title,
        start_url: '/',
        theme_color: color,
        background_color: color,
        display: 'standalone',
    });
}

export default {
    '-en-dark': (data) => manifest(data, 'en', 'dark'),
    '-pl-dark': (data) => manifest(data, 'pl', 'dark'),
    '-en-light': (data) => manifest(data, 'en', 'light'),
    '-pl-light': (data) => manifest(data, 'pl', 'light'),
}