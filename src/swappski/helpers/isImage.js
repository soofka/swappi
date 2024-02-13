export function isImage(direntData) {
  return [".avif", ".gif", ".jpg", ".jpeg", ".png", ".svg", ".webp"].includes(
    direntData.ext,
  );
}

export default isImage;
