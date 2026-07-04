const themeScript = `
(function () {
  try {
    var choice = localStorage.getItem("lexicon-theme");
    var theme = choice === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themeChoice = theme;
  } catch (error) {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.dataset.themeChoice = "dark";
  }
})();
`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
