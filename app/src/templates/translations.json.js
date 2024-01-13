const translations = (data, lang) => {
    const meta = {
        'title': data[lang].title,
        'description': data[lang].description,
        'keywords': data[lang].keywords,
        'author': data[lang].author,
    };

    const result = lang === 'pl'
        ? {
            meta,
            'navigation': {
                'home': 'home',
                'about': 'o mnie',
                'contact': 'kontakt'
            },
            'about': {
                'intro': {
                    'head': 'Cześć!',
                    'lead': 'My name is Jakub, I am a software developer, architect, and teacher based in Warsaw, Poland.',
                    'text': [
                        '<p>I can help you, your developers, development teams, and your software itself become better.</p>',
                        '<p>Scroll right &rarr; to read more about me, or scroll down &darr; to contact me.</p>'
                    ]
                },
                'developer': {
                    'head': 'Developer',
                    'lead': 'I have over 10 years of experience as a full-stack web developer in various companies, projects, and programming languages.',
                    'text': 'Check out my LinkedIn to read more about my experience, or browse some of my projects on my GitHub.'
                },
                'architect': {
                    'head': 'Architect',
                    'lead': 'I have over 5 years of experience as a software and solution architect for large, international corporation. As an only architect responsible for frontend development, it was my responsibility to define, document, and help implement architecture for product built by hundreds of developers.',
                    'text': 'Check out my Medium to read some of my articles, or click here to watch some of my talks on software architecture.'
                },
                'teacher': {
                    'head': 'Teacher',
                    'lead': 'I have over 5 years of experience as a coach, mentor, trainer, and teacher in IT. I worked as a coach, mentor, and frontend chapter lead in my previous companies. I was an IT teacher in high school and am a lecturer for \'Software Architecture\' classes at PJATK university in Warsaw. I work as a trainer with non-profit IT training organizations such as girls.js.',
                    'text': 'Click here to access some of my free courses, or click here to watch some of my talks from past IT conferences.'
                },
                'person': {
                    'head': 'Person',
                    'lead': 'I am human being.',
                    'text': 'I love music, so check out my last.fm profile!'
                }
            },
            'contact': {
                'head': 'Contact me'
            }
        }
        : {
            meta,
            'navigation': {
                'home': 'home',
                'about': 'about',
                'contact': 'contact'
            },
            'about': {
                'intro': {
                    'head': 'Hello!',
                    'lead': 'My name is Jakub, I am a software developer, architect, and teacher based in Warsaw, Poland.',
                    'text': [
                        '<p>I can help you, your developers, development teams, and your software itself become better.</p>',
                        '<p>Scroll right &rarr; to read more about me, or scroll down &darr; to contact me.</p>'
                    ]
                },
                'developer': {
                    'head': 'Developer',
                    'lead': 'I have over 10 years of experience as a full-stack web developer in various companies, projects, and programming languages.',
                    'text': 'Check out my LinkedIn to read more about my experience, or browse some of my projects on my GitHub.'
                },
                'architect': {
                    'head': 'Architect',
                    'lead': 'I have over 5 years of experience as a software and solution architect for large, international corporation. As an only architect responsible for frontend development, it was my responsibility to define, document, and help implement architecture for product built by hundreds of developers.',
                    'text': 'Check out my Medium to read some of my articles, or click here to watch some of my talks on software architecture.'
                },
                'teacher': {
                    'head': 'Teacher',
                    'lead': 'I have over 5 years of experience as a coach, mentor, trainer, and teacher in IT. I worked as a coach, mentor, and frontend chapter lead in my previous companies. I was an IT teacher in high school and am a lecturer for \'Software Architecture\' classes at PJATK university in Warsaw. I work as a trainer with non-profit IT training organizations such as girls.js.',
                    'text': 'Click here to access some of my free courses, or click here to watch some of my talks from past IT conferences.'
                },
                'person': {
                    'head': 'Person',
                    'lead': 'I am human being.',
                    'text': 'I love music, so check out my last.fm profile!'
                }
            },
            'contact': {
                'head': 'Contact me'
            }
        };

    return JSON.stringify(result);
}

export default {
    '-en': (data) => translations(data, 'en'),
    '-pl': (data) => translations(data, 'pl'),
}
