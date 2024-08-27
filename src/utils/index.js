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

export function getDateDifference(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  let yearsDifference = end.getFullYear() - start.getFullYear();
  let monthsDifference = end.getMonth() - start.getMonth();

  if (monthsDifference < 0) {
    yearsDifference--;
    monthsDifference += 12;
  }

  if (yearsDifference > 0) {
    return `${yearsDifference} ${yearsDifference > 1 ? 'سنوات' : 'سنة'}`;
  } else if (monthsDifference > 0) {
    return `${monthsDifference} ${monthsDifference > 1 ? 'أشهر' : 'شهر'}`;
  } else {
    return 'أقل من شهر';
  }
}
