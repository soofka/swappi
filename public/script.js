let lang = 'en';
let theme = 'light';
let labels = {};

const initLabels = async () => {
    if (localStorage.getItem('lang')) {
        lang = localStorage.getItem('lang');
    } else if (navigator.language && navigator.language.substring(0,2) === 'pl') {
        lang = 'pl';
    }

    setLabels();

    window.addEventListener('languagechange', () => {
        const shortLang = navigator.language.substring(0,2);
        lang = shortLang === 'en' ? 'en' : (shortLang === 'pl' ? 'pl' : 'en');
        setLabels();
    });

    document.querySelector('#lang-toggle').addEventListener('click', () => {
        lang = lang === 'en' ? 'pl' : 'en';
        setLabels();
    });
}

const setLabels = async () => {
    if (!labels.hasOwnProperty(lang)) {
        labels[lang] = await (await fetch(`${lang}.json`)).json();
    }

    console.log(labels);

    document.querySelectorAll('[data-t]').forEach((element) => {
        let tempLabel = labels[lang];
        let value = element.dataset.t;
        const keys = value.split('.');

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
            value = value.join('');
        }

        element.innerHTML = value;
    });

    localStorage.setItem('lang', lang);
    document.querySelector('#lang-toggle').innerText = lang === 'en' ? 'pl' : 'en';
}

const initTheme = () => {
    document.documentElement.style.display = 'none';

    if (localStorage.getItem('theme')) {
        theme = localStorage.getItem('theme');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'dark';
    }

    setTheme();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        theme = e.matches ? 'dark' : 'light';
        setTheme();
    });

    document.querySelector('#theme-toggle').addEventListener('click', () => {
        theme = theme === 'dark' ? 'light' : 'dark';
        setTheme();
    });

    document.documentElement.style.display = '';
}

const setTheme = () => {
    const styleLink = document.querySelector('link[id="theme"]');
    styleLink.href = styleLink.attributes[`data-href-${theme}`].value;

    // const manifestLink = document.querySelector('link[rel="manifest"]');
    // manifestLink.href = manifestLink.attributes[`data-href-${theme}`].value;

    // const faviconLink = document.querySelectorAll('link[rel="icon"]');
    // faviconLink.href = faviconLink.attributes[`data-href-${theme}`].value;

    // const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    // themeColorMeta.content = theme === 'dark' ? '#000' : '#fff';

    localStorage.setItem('theme', theme);
    document.querySelector('#theme-toggle').innerText = theme === 'dark' ? 'light' : 'dark';
}

const initIntroTextSwitcher = () => {
    const textContainer = document.querySelector('#intro h3 .text');
    const blinker = document.querySelector('#intro h3 .blinker');
    const texts = ['developer', 'architect', 'teacher'];

    const forwardTimeoutRange = [150, 300];
    const backwardTimeoutRange = [30, 60];
    const blinkInterval = 500;
    const fullWordBlinkCount = 6;
    const noWordBlinkCount = 2;
    
    let timeout = 0;
    let currentTextId = 0;
    let currentLetterId = 0;
    let currentBlinkCount = 0;
    let mode = 0; // 0 - forward, 1 - blink when typed, 2 - backward, 3 - blink when empty

    const type = () => {
        textContainer.innerText = texts[currentTextId].substr(0, currentLetterId);

        switch (mode) {
            case 0:
                currentLetterId++;
                timeout = getTimeout(forwardTimeoutRange);
                if (currentLetterId > texts[currentTextId].length) {
                    mode = 1;
                }
                break;

            case 1:
                blink();
                currentBlinkCount++;
                timeout = blinkInterval;
                if (currentBlinkCount >= fullWordBlinkCount) {
                    currentBlinkCount = 0;
                    mode = 2;
                }
                break;

            case 2:
                currentLetterId--;
                timeout = getTimeout(backwardTimeoutRange);
                if (currentLetterId === 0) {
                    mode = 3;
                    currentTextId++;
                    if (currentTextId >= texts.length) {
                        currentTextId = 0;
                    }
                }
                break;

            case 3:
                blink();
                currentBlinkCount++;
                timeout = blinkInterval;
                if (currentBlinkCount >= noWordBlinkCount) {
                    currentBlinkCount = 0;
                    mode = 0;
                }
                break;

            default:
                break;
        }

        setTimeout(type, timeout);
    }

    const getTimeout = (range) => Math.random() * (range[1] - range[0]) + range[0];
    const blink = () => blinker.style.visibility === 'hidden' ? blinker.style.visibility = '' : blinker.style.visibility = 'hidden';

    type();
}

initLabels();
initTheme();
initIntroTextSwitcher();