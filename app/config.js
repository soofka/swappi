import path from 'path';

const appPath = path.resolve('app');
export const config = {
    src: path.join(appPath, 'src', 'public'),
    dist: path.join(appPath, 'dist'),

    partials: path.join(appPath, 'src', 'partials'),
    templates: path.join(appPath, 'src', 'templates'),
    templatesOutput: path.join(appPath, 'src', 'public', 'generated'),

    options: {
        optimize: {
            js: {
                mangle: true,
                mangleClassNames: true,
                removeUnusedVariables: true,
                removeConsole: true,
                removeUselessSpread: true,
            },
            img: {
                widths: [256, 320, 640, 1280, 1920, 2560],
                types: ['webp', 'avif', 'jpeg'],
            },
            html: {
                removeComments: false,
                removeCommentsFromCDATA: true,
                removeCDATASectionsFromCDATA: true,
                collapseWhitespace: true,
                collapseBooleanAttributes: true,
                removeAttributeQuotes: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeEmptyElements: false,
                removeOptionalTags: false,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                minifyJS: true,
                minifyCSS: true,
            },
            css: {
                compatibility: '*',
            },
        },
    },

    data: {
        en: {
            title: 'swn.ski',
            decription: 'swn.ski description',
            keywords: ['swn.ski', 'key', 'word'],
            author: 'swn.ski en',
        },
        pl: {
            title: 'swn.ski',
            decription: 'swn.ski opis',
            keywords: ['swn.ski', 'słowo', 'kluczowe'],
            author: 'swn.ski pl',
        },
        colors: ['#f4f7fc', '#dfe7f2', '#8fa4c3', '#586c91', '#283347'],
    },
}
