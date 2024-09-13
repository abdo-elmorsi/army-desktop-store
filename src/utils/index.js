import { differenceInDays, parseISO } from "date-fns";


export function formatComma(value, minimumFractionDigits = 3) {
    value = value ? parseFloat(value) : 0;
    return value.toLocaleString("en-US", {
        minimumFractionDigits: minimumFractionDigits,
        maximumFractionDigits: Math.max(2, minimumFractionDigits),
    });
}
export function sum(arr, prop) {
    return arr.reduce((accumulator, object) => {
        return accumulator + (prop ? +object[prop] : object);
    }, 0);
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
        return `${yearsDifference} ${yearsDifference > 1 ? "سنوات" : "سنة"}`;
    } else if (monthsDifference > 0) {
        return `${monthsDifference} ${monthsDifference > 1 ? "أشهر" : "شهر"}`;
    } else {
        return "أقل من شهر";
    }
}



export const isExpiringSoon = (expiryDate) => {
    return differenceInDays(parseISO(expiryDate), new Date()) < 30;
  };
