const app = {
    
    lang: 'en',
    theme: 'light',
    labels: {},
    elements: {},

    init: function() {
        this.initLang();
        this.initTheme();
        initIntroTextSwitcher();
    },
    
    initLang: function() {
        let lang = navigator.language.substring(0,2);

        if (localStorage.getItem('lang')) {
            lang = localStorage.getItem('lang');
        }

        this.setLang(lang, true);
    
        window.addEventListener('languagechange', () => {
            this.setLang(navigator.language.substring(0,2));
        });
    
        document.querySelector('#lang-toggle').addEventListener('click', () => {
            this.setLang(this.lang === 'en' ? 'pl' : 'en');
        });
    },

    setLang: function(lang, force = false) {
        if ((lang === 'en' || lang === 'pl') && (lang !== this.lang || force)) {
            this.lang = lang;
            localStorage.setItem('lang', lang);
            this.getElement('lang-toggle', '#lang-toggle').innerText = lang === 'en' ? 'pl' : 'en';
            this.setLabels();
        }
    },

    setLabels: async function() {
        if (!this.labels.hasOwnProperty(this.lang)) {
            this.labels[this.lang] = await (await fetch(`${this.lang}.json`)).json();
        }
    
        this.getElements('labels', '[data-t]').forEach((element) => {
            let tempLabel = this.labels[this.lang];
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
    },

    initTheme: function() {
        let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
        if (localStorage.getItem('theme')) {
            theme = localStorage.getItem('theme');
        }
    
        this.setTheme(theme, true);
    
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            this.setTheme(e.matches ? 'dark' : 'light');
        });
    
        document.querySelector('#theme-toggle').addEventListener('click', () => {
            this.setTheme(this.theme === 'light' ? 'dark' : 'light');
        });
    },

    setTheme: function(theme, force = false) {
        if ((theme === 'light' || theme === 'dark') && (theme !== this.theme || force)) {
            this.theme = theme;
            localStorage.setItem('theme', theme);
            this.getElement('theme-toggle', '#theme-toggle').innerText = theme === 'light' ? 'dark' : 'light';
            this.setStyle();
        }
    },

    setStyle: function() {
        const styleLink = document.querySelector('link[id="theme"]');
        styleLink.href = styleLink.attributes[`data-href-${this.theme}`].value;
    
        // const manifestLink = document.querySelector('link[rel="manifest"]');
        // manifestLink.href = manifestLink.attributes[`data-href-${theme}`].value;
    
        // const faviconLink = document.querySelectorAll('link[rel="icon"]');
        // faviconLink.href = faviconLink.attributes[`data-href-${theme}`].value;
    
        // const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        // themeColorMeta.content = theme === 'dark' ? '#000' : '#fff';
    },

    getElement: function(name, selector) {
        return this.getElements(name, selector)[0];
    },

    getElements: function(name, selector) {
        if (!Object.hasOwnProperty(this.elements, name)) {
            this.elements[name] = document.querySelectorAll(selector);
        }
        return this.elements[name];
    },

};

app.init();

// let lang = 'en';
// let theme = 'light';
// let labels = {};

// const setLabels = async () => {
// }

// const initTheme = () => {
// }

// const setTheme = () => {
//     const styleLink = document.querySelector('link[id="theme"]');
//     styleLink.href = styleLink.attributes[`data-href-${theme}`].value;

//     // const manifestLink = document.querySelector('link[rel="manifest"]');
//     // manifestLink.href = manifestLink.attributes[`data-href-${theme}`].value;

//     // const faviconLink = document.querySelectorAll('link[rel="icon"]');
//     // faviconLink.href = faviconLink.attributes[`data-href-${theme}`].value;

//     // const themeColorMeta = document.querySelector('meta[name="theme-color"]');
//     // themeColorMeta.content = theme === 'dark' ? '#000' : '#fff';

//     localStorage.setItem('theme', theme);
//     document.querySelector('#theme-toggle').innerText = theme === 'dark' ? 'light' : 'dark';
// }

function initIntroTextSwitcher() {
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
