import path from 'path';

const appPath = path.resolve('app');
export const config = {
    src: path.join(appPath, 'src', 'public'),
    dist: path.join(appPath, 'dist'),
    templates: path.join(appPath, 'src', 'templates'),

    options: {
        resizeImages: true,
        resizeImagesInHtml: true,
        resizedImagesWidths: [256, 320, 640, 1280, 1920, 2560],
        optimizeImages: true,
        optimizeImagesInHtml: true,
        optimizedImagesTypes: ['webp', 'avif', 'jpeg'],

        minify: {
            js: {
                mangle: true,
                mangleClassNames: true,
                removeUnusedVariables: true,
                removeConsole: true,
                removeUselessSpread: true,
            },
            img: {
                maxSize: 4096,
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
        title: 'swn.ski',
    },
}
