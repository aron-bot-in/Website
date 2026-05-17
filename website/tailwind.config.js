export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui"],
        body: ["Inter", "ui-sans-serif", "system-ui"]
      },
      colors: {
        ink: "#0b0b12",
        panel: "#101018",
        charcoal: "#161826",
        cyan: "#86f0f0",
        violet: "#8f00f2",
        rose: "#f08fb0",
        silver: "#b7b7c2",
        steel: "#5f5f67"
      },
      boxShadow: {
        glow: "0 0 36px rgba(64, 230, 255, 0.22)",
        card: "0 28px 70px rgba(0, 0, 0, 0.42)"
      }
    }
  },
  plugins: []
};
