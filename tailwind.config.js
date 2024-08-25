/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#336a86",
                hoverPrimary: "#28556c",
                secondary: "#e8fffe",
                text: "#2f353b",
                textLight: "#777e90",
                inputBorder: "#DCDFE3",
            },
        },
    },
    corePlugins: {
        preflight: false,
    },
    plugins: [],
};
