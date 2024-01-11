const app = {
    
    lang: 'en',
    theme: 'light',
    labels: {},
    elements: {},
    anchorMap: {},

    init: function() {
        this.updateLoadingBar(0.1);
        this.initLang();
        this.updateLoadingBar(0.25);
        this.initTheme();
        this.updateLoadingBar(0.4);
        this.initScrollAnchors();
        this.updateLoadingBar(0.6);
        this.initIntroTextSwitcher();
        this.updateLoadingBar(0.75);
        this.initAboutScroll();
        this.updateLoadingBar(0.9);
        this.initMisc();
        this.updateLoadingBar(1);
    },

    updateLoadingBar: function(percentage) {
        this.getElement('loading-bar', '#loading-bar').style.width = `${percentage * 100}%`;
        if (percentage === 1) {
            this.getElement('body', 'body').classList.remove('loading');
            this.getElement('loading-container', '#loading-container').remove();
        }
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
    
        this.getElement('lang-toggle', '#lang-toggle').addEventListener('click', () => {
            this.setLang(this.lang === 'en' ? 'pl' : 'en');
        });
    },

    setLang: function(lang, force = false) {
        if ((lang === 'en' || lang === 'pl') && (lang !== this.lang || force)) {
            this.lang = lang;
            localStorage.setItem('lang', lang);
            document.documentElement.setAttribute('lang', lang);
            this.getElement('meta-lang', 'meta[http-equiv="content-language"]').setAttribute('content', lang);
            this.getElement('lang-toggle-text', '#lang-toggle p').innerText = lang === 'en' ? 'pl' : 'en';
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
    
        this.getElement('theme-toggle', '#theme-toggle').addEventListener('click', () => {
            this.setTheme(this.theme === 'light' ? 'dark' : 'light');
        });
    },

    setTheme: function(theme, force = false) {
        if ((theme === 'light' || theme === 'dark') && (theme !== this.theme || force)) {
            this.theme = theme;
            localStorage.setItem('theme', theme);
            this.getElement('theme-toggle-text', '#theme-toggle p').innerText = theme === 'light' ? 'dark' : 'light';
            this.setStyle();
        }
    },

    setStyle: function() {
        // document.documentElement.style.display = 'none';

        const themeStyleLink = this.getElement('theme-style-link', 'link[id="theme"]');
        themeStyleLink.href = themeStyleLink.attributes[`data-href-${this.theme}`].value;
    
        const manifestLink = document.querySelector('link[rel="manifest"]');
        manifestLink.href = manifestLink.attributes[`data-href-${this.theme}`].value;
    
        // const faviconLink = document.querySelectorAll('link[rel="icon"]');
        // faviconLink.href = faviconLink.attributes[`data-href-${theme}`].value;
    
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        themeColorMeta.content = themeColorMeta.attributes[`data-content-${this.theme}`].value;

        // document.documentElement.style.display = '';
    },

    initScrollAnchors: function() {
        this.calculateAnchorMap();
        window.addEventListener('resize', () => this.calculateAnchorMap());

        if ('onscrollend' in window) {
            [window, ...this.getElements('horizontal-anchors-containers', '[data-anchor-x-container]')].forEach((element) => {
                element.addEventListener('scrollend', () => this.setHash());
            });
        } else {
            [window, ...this.getElements('horizontal-anchors-containers', '[data-anchor-x-container]')].forEach((element) => {
                element.addEventListener('scroll', () => {
                    clearTimeout(window.scrollEndTimeout);
                    window.scrollEndTimeout = setTimeout(() => this.setHash(), 500);
                });
            });
        }

        const checkHash = (anchor) => anchor.hash === this.getHash();
        let anchor = this.anchorMap.y.find((x) => checkHash(x));
        if (anchor) {
            this.scroll(anchor.start);
        } else {
            anchor = this.anchorMap.x.find((x) => checkHash(x));
            if (anchor) {
                this.scroll(anchor.parent.start);
                this.scroll(0, anchor.start, anchor.parent.ref);
            }
        }
        
        this.highlightActiveMenuItem();
    },

    calculateAnchorMap: function() {
        this.anchorMap.y = Array.from(this.getElements('vertical-anchors', '[data-anchor-y]')).map((element) => ({
            start: element.offsetTop,
            end: element.offsetTop + element.offsetHeight,
            hash: element.dataset.anchorY,
        }));

        this.anchorMap.x = Array.from(this.getElements('horizontal-anchors', '[data-anchor-x]')).map((element) => ({
            parent: {
                start: element.parentElement.offsetTop,
                end: element.parentElement.offsetTop + element.parentElement.offsetHeight,
                ref: element.parentElement,
            },
            start: element.offsetLeft,
            end: element.offsetLeft + element.offsetWidth,
            hash: element.dataset.anchorX,
        }));
    },

    getHash: function() {
        return window.location.hash ? window.location.hash.substring(1) : '';
    },

    setHash: function() {
        this.anchorMap.y.forEach((anchor) => {
            if (window.scrollY >= anchor.start && window.scrollY < anchor.end) {
                console.log('setting hash', anchor.hash);
                history.pushState({}, '', `#${anchor.hash}`);
                // window.location.hash = anchor.hash;
                this.highlightActiveMenuItem();
            }
        });

        this.anchorMap.x.forEach((anchor) => {
            if (window.scrollY >= anchor.parent.start && window.scrollY < anchor.parent.end && anchor.parent.ref.scrollLeft >= anchor.start && anchor.parent.ref.scrollLeft < anchor.end) {
                console.log('setting hash', anchor.hash);
                history.pushState({}, '', `#${anchor.hash}`);
                // window.location.hash = anchor.hash;
            }
        });
    },

    highlightActiveMenuItem: function() {     
        this.getElements('menu-links', 'header nav #menu a').forEach((element) => {
            if (`#${this.getHash().split('-')[0]}` === element.getAttribute('href')) {
                element.classList.add('active');
            } else {
                element.classList.remove('active');
            }
        });
    },

    initIntroTextSwitcher: function() {
        const container = this.getElement('intro-text-switcher', '#intro-text-switcher');
        const texts = container.dataset.texts.split(',');
        const text = this.getElement('intro-text-switcher-text', '.text', container);
        const blinker = this.getElement('intro-text-switcher-blinker', '.blinker', container);

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
            text.innerText = texts[currentTextId].substring(0, currentLetterId);
    
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
    },

    initAboutScroll() {
        const container = this.getElement('about-section', '#about');

        this.getElements('about-items', '.item', container).forEach((item, index, array) => {
            const scrollLeft = this.getElement(`about-item-${index}-scroll-left`, '#scroll-left', item);
            const scrollRight = this.getElement(`about-item-${index}-scroll-right`, '#scroll-right', item);

            if (scrollLeft) {
                scrollLeft.addEventListener('click', () => this.scroll(0, item.scrollWidth * (index - 1), container));
            }

            if (scrollRight) {
                scrollRight.addEventListener('click', () => this.scroll(0, item.scrollWidth * (index + 1), container));
            }
        });
    },

    initMisc: function() {
        this.getElement('current-year', '#current-year').innerText = new Date().getFullYear();
    },

    getElement: function(name, selector, parent = document) {
        return this.getElements(name, selector, parent)[0];
    },

    getElements: function(name, selector, parent = document) {
        if (!Object.hasOwnProperty(this.elements, name)) {
            this.elements[name] = parent.querySelectorAll(selector);
        }
        return this.elements[name];
    },

    scroll: function(top, left = 0, container = window) {
        console.log('scrolling', top, left);
        container.scroll({ top, left, behavior: 'smooth' });
    },

};

app.init();
