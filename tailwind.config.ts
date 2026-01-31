/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        marker: ['"Permanent Marker"', "cursive"],
      },
      colors: {
        fiber: {
          dark: "#111111",
          card: "#1A1A1A",
          orange: "#FF6B00",
          green: "#25D366",
          lime: "#32CD32",
          blue: "#1E90FF",
          red: "#FF3B3B",
        },
        nubank: {
          primary: "#820AD1",
          secondary: "#9422E3",
          dark: "#191919",
          bg: "#111111",
          glass: "rgba(255, 255, 255, 0.05)",
          glassHover: "rgba(255, 255, 255, 0.1)",
          text: "#F5F5F5",
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        fly: "fly 2s ease-in-out infinite",
        fadeIn: "fadeIn 0.5s ease-out forwards",
        "subtle-bounce": "subtleBounce 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fly: {
          "0%, 100%": { transform: "translateY(0) translateX(0) rotate(0deg)" },
          "50%": {
            transform: "translateY(-20px) translateX(5px) rotate(3deg)",
          },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        subtleBounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
    },
  },
  plugins: [],
};
