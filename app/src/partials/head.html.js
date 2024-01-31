// USE FILES FOR ICONS
const head = (htmlElement, data, rootDirectory) => `
    <head>
        <meta charset="utf-8">
        <title>${data.labels[config.data.langs[0]].meta.title}</title>
        <meta name="author" content="${data.author}">"
        <meta name="description" content="${data.labels[config.data.langs[0]].meta.description}">
        <meta property="og:title" content="${data.labels[config.data.langs[0]].meta.title}">
        <meta property="og:type" content="${data.type}">
        <meta property="og:url" content="${data.url}">
        <meta property="og:description" content="${data.labels[config.data.langs[0]].meta.description}">
        <meta property="og:image" content="me.jpg">
        <meta property="og:image:alt" content="me">
        
        <meta name="robots" content="index,follow"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">

        ${data.themes.map((theme, index) => {
            const media = index > 0 ? `media="(prefers-color-scheme: ${theme.name})"` : '';
            return `
                <meta name="theme-color" content="${theme.color}" ${media}></meta>
                <link rel="manifest" href="manifest-${data.langs[0]}-${theme.name}.webmanifest" ${media}/>
            `;
        }).join('')}
        <meta name="color-scheme" content="${data.themes.map((theme) => theme.name).join(' ')}">

        ${config.data.langs.map((lang) => `
            <link rel="alternate" href="${data.url}?lang=${lang}" hreflang="${lang}" />
        `).join('')}
        <link rel="canonical" href="${data.url}" />

        <link rel="stylesheet" id="theme" href="style-${data.themes[0].name}.css" />
        <link rel="stylesheet" href="style.css" />
    </head>
`

export default head;
