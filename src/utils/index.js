export const getLabel = (id, arr = []) => {
    return arr?.find((a) => a.id === id)?.name || "";
};

export const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };
  

  export function formatComma(value, minimumFractionDigits = 2) {
    value = value ? parseFloat(value) : 0;
    return value.toLocaleString('en-US', { minimumFractionDigits: minimumFractionDigits, maximumFractionDigits: Math.max(2, minimumFractionDigits) });
}
