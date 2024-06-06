export const decodeBase64 = base64String => {
  const decodedString = atob(base64String);
  return decodedString;
};
