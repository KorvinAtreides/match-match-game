export default async function convertAvatarsDb(url: string) {
  const image = new Image();
  image.setAttribute('crossOrigin', 'anonymous');
  const canvas = document.createElement('canvas');
  image.src = url;
  const imagePromise = new Promise<string>((resolve) => {
    image.onload = function onload() {
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
      const dataURL = canvas.toDataURL();
      resolve(dataURL);
    };
  });
  return imagePromise;
}
