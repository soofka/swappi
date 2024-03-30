const scriptSrc = "https://www.youtube.com/iframe_api";

const youtube = (data, dists, { id, title, width, height }) => {
  const elementId = `yt-${id}`;
  return `<img
      id="${elementId}"
      src="https://img.youtube.com/vi/${id}/0.jpg"
      alt="${title}"
      width="${width}"
      height="${height}"
      style="cursor:pointer"
      onClick="
        if (
          !Array.from(document.getElementsByTagName('script')).find(
            (script) => script.getAttribute('src') === '${scriptSrc}',
          )
        ) {
          const scriptTag = document.createElement('script');
          scriptTag.src = '${scriptSrc}';
          document.body.append(scriptTag);
        }
        window.onYouTubeIframeAPIReady = function() {
          new YT.Player('${elementId}', { videoId: '${id}', width: '100%', height: 'auto' });
        }
      "
    >`;
};

export default youtube;
