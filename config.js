import path from 'path';

export const config = {
    src: path.resolve('src'),
    dist: path.resolve('dist'),

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
}
