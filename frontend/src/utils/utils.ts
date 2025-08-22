export const toBase64 = (f: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.readAsDataURL(f);
    r.onload = () => resolve(r.result as string);
    r.onerror = (error) => reject(error);
  });
};
