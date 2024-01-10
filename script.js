let lang = 'en';
let theme = 'light';

const initTranslations = async () => {
    // const translations = (await fetch(`${lang}.json`)).json();
    // console.log('translations', translations);
    const translations = {
        "navigation": {
            "home": "home",
            "about": "about",
            "contact": "contact"
        },
        "about": {
            "intro": {
                "head": "Hello!",
                "lead": "My name is Jakub, I am a software developer, architect, and teacher based in Warsaw, Poland.",
                "text": [
                    "<p>I can help you, your developers, development teams, and your software itself become better.</p>",
                    "<p>Scroll right &rarr; to read more about me, or scroll down &darr; to contact me.</p>"
                ]
            },
            "developer": {
                "head": "Developer",
                "lead": "I have over 10 years of experience as a full-stack web developer in various companies, projects, and programming languages.",
                "text": "Check out my LinkedIn to read more about my experience, or browse some of my projects on my GitHub."
            },
            "architect": {
                "head": "Architect",
                "lead": "I have over 5 years of experience as a software and solution architect for large, international corporation. As an only architect responsible for frontend development, it was my responsibility to define, document, and help implement architecture for product built by hundreds of developers.",
                "text": "Check out my Medium to read some of my articles, or click here to watch some of my talks on software architecture."
            },
            "teacher": {
                "head": "Teacher",
                "lead": "I have over 5 years of experience as a coach, mentor, trainer, and teacher in IT. I worked as a coach, mentor, and frontend chapter lead in my previous companies. I was an IT teacher in high school and am a lecturer for \"Software Architecture\" classes at PJATK university in Warsaw. I work as a trainer with non-profit IT training organizations such as girls.js.",
                "text": "Click here to access some of my free courses, or click here to watch some of my talks from past IT conferences."
            },
            "person": {
                "head": "Person",
                "lead": "I am human being.",
                "text": "I love music, so check out my last.fm profile!"
            }
        }
    };

    document.querySelectorAll('[data-t]').forEach((element) => {
        let tempTranslation = translations;
        let value = element.dataset.t;
        const keys = value.split('.');

        for (let i = 0; i < keys.length; i++) {
            if (tempTranslation.hasOwnProperty(keys[i])) {
                tempTranslation = tempTranslation[keys[i]];

                if (i === keys.length - 1) {
                    value = tempTranslation;
                }
            } else {
                break;
            }
        }

        element.innerHTML = value;
    });
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
    localStorage.setItem('theme', theme);

    const styleLink = document.querySelector('link[id="theme"]');
    styleLink.href = styleLink.attributes[`data-href-${theme}`].value;

    // const manifestLink = document.querySelector('link[rel="manifest"]');
    // manifestLink.href = manifestLink.attributes[`data-href-${theme}`].value;

    // const faviconLink = document.querySelectorAll('link[rel="icon"]');
    // faviconLink.href = faviconLink.attributes[`data-href-${theme}`].value;

    // const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    // themeColorMeta.content = theme === 'dark' ? '#000' : '#fff';

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

initTranslations();
initTheme();
initIntroTextSwitcher();