export const generateQRCode = (value: string): string => {
  // Use QR Server API to generate QR codes
  const encodedValue = encodeURIComponent(value);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedValue}`;
};
