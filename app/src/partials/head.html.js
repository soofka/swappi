// use files?
const head = (element, attributes, config, files) => '';
// DATA????
// `
//     <head>
//         <meta charset="utf-8">
//         <title>${config.data.labels[config.data.langs[0]].meta.title}</title>
//         <meta name="author" content="${config.data.author}">"
//         <meta name="description" content="${config.data.labels[config.data.langs[0]].meta.description}">
//         <meta property="og:title" content="${config.data.labels[config.data.langs[0]].meta.title}">
//         <meta property="og:type" content="${config.data.type}">
//         <meta property="og:url" content="${config.data.url}">
//         <meta property="og:description" content="${config.data.labels[config.data.langs[0]].meta.description}">
//         <meta property="og:image" content="me.jpg">
//         <meta property="og:image:alt" content="me">
        
//         <meta name="robots" content="index,follow"/>
//         <meta name="viewport" content="width=device-width, initial-scale=1">

//         ${config.options.optimize.img.types.map((type) => `
//             <link rel="icon" type="image/${type}" href="icon.${type}">
//         `).join('')}

//         ${config.data.themes.map((theme, index) => {
//             const media = index > 0 ? `media="(prefers-color-scheme: ${theme.name})"` : '';
//             return `
//                 <meta name="theme-color" content="${theme.color}" ${media}></meta>
//                 <link rel="manifest" href="manifest-${config.data.langs[0]}-${theme.name}.webmanifest" ${media}/>
//             `;
//         }).join('')}
//         <meta name="color-scheme" content="${config.data.themes.map((theme) => theme.name).join(' ')}">

//         ${config.data.langs.map((lang) => `
//             <link rel="alternate" href="${config.data.url}?lang=${lang}" hreflang="${lang}" />
//         `).join('')}
//         <link rel="canonical" href="${config.data.url}" />

//         <link rel="stylesheet" id="theme" href="style-${config.data.themes[0].name}.css" />
//         <link rel="stylesheet" href="style.css" />
//     </head>
// `

export default head;
