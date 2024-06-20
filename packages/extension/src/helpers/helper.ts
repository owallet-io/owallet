export const decodeBase64 = (base64String) => {
  const decodedString = atob(base64String);
  return decodedString;
};

export function numberWithCommas(number) {
  if (Number(number) <= 0) return 0.0;
  // Convert the number to a string and split it into integer and decimal parts
  const [intPart, decPart] = number.toString().split(".");

  // Insert commas into the integer part
  const formattedNumber = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Combine the formatted integer part and the decimal part
  return formattedNumber + "." + decPart;
}

export const isProdMode = "update_url" in chrome.runtime.getManifest();
