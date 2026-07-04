const themeScript = `
(function () {
  try {
    var choice = localStorage.getItem("lexicon-theme") || "system";
    var prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    var theme = choice === "system" ? (prefersLight ? "light" : "dark") : choice;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themeChoice = choice;
  } catch (error) {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.dataset.themeChoice = "system";
  }
})();
`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
