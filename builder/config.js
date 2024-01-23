import path from 'path';

export const config = {
    paths: {
        dist: path.resolve('dist'),
        public: path.resolve(path.join('src','public')),
        partials: path.resolve(path.join('src','partials')),
        templates: path.resolve(path.join('src','templates')),
        generated: path.resolve(path.join('src','generated')),
        report: path.resolve('report.json'),
    },

    options: {
        verbosity: 4,
        hash: true,
        force: false,

        optimize: {
            js: {},
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

    constants: {
        other: 'other',
        hashAlgorithm: 'sha256',
        hashSeparator: '+',
        htmlPartialAttribute: 'data-swapp-partial',
        cssPartialDeclaration: '-swapp-partial',
        jsonPartialField: '_partial',
        filesGroupMap: {
            html: ['.html'],
            css: ['.css'],
            js: ['.js'],
            json: ['.json', '.webmanifest'],
            img: ['.avif', '.webp', '.gif', '.png', '.jpg', '.jpeg', '.svg'],
        },
    },
};

export default config;
