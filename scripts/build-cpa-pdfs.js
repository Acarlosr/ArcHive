const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const sourceDir = path.join(root, "material-entrega-aluno");
const htmlDir = path.join(sourceDir, "pdf-html");
const pdfDir = path.join(sourceDir, "pdf");
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const docs = [
  ["01-apostila-cpa10.md", "01-apostila-cpa10.pdf", "Apostila CPA-10"],
  ["02-plano-de-estudos.md", "02-plano-de-estudos.pdf", "Plano de Estudos"],
  ["03-questoes-comentadas.md", "03-questoes-comentadas.pdf", "Questões Comentadas"],
  ["04-simulados.md", "04-simulados.pdf", "Simulados"],
  ["05-checklist-vespera.md", "05-checklist-vespera.pdf", "Checklist de Véspera"],
];

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineFormat(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let listOpen = false;
  let paragraph = [];

  function flushParagraph() {
    if (paragraph.length > 0) {
      html.push(`<p>${inlineFormat(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  }

  function closeList() {
    if (listOpen) {
      html.push("</ul>");
      listOpen = false;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }

    if (line === "---") {
      flushParagraph();
      closeList();
      html.push("<hr />");
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineFormat(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = line.match(/^-\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${inlineFormat(bullet[1])}</li>`);
      continue;
    }

    flushParagraph();
    closeList();
    html.push(`<p>${inlineFormat(line)}</p>`);
  }

  flushParagraph();
  closeList();
  return html.join("\n");
}

function pageHtml(title, body) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page { margin: 18mm 16mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: #182033;
        font: 14px/1.62 -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      }
      .cover {
        padding: 30mm 0 18mm;
        border-bottom: 3px solid #c49a49;
        margin-bottom: 16mm;
      }
      .kicker {
        margin: 0 0 12px;
        color: #0c7a74;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: .12em;
        text-transform: uppercase;
      }
      .cover h1 {
        max-width: 620px;
        margin: 0 0 12px;
        color: #0c1323;
        font-size: 38px;
        line-height: 1.04;
      }
      .cover p {
        max-width: 620px;
        margin: 0;
        color: #586277;
        font-size: 15px;
      }
      h1, h2, h3, h4 {
        color: #0c1323;
        break-after: avoid;
      }
      h1 {
        margin: 28px 0 14px;
        font-size: 30px;
        line-height: 1.12;
      }
      h2 {
        margin: 24px 0 10px;
        padding-top: 8px;
        border-top: 1px solid #e1e5ee;
        font-size: 21px;
      }
      h3 {
        margin: 18px 0 8px;
        color: #113d43;
        font-size: 16px;
      }
      h4 {
        margin: 14px 0 8px;
        font-size: 14px;
      }
      p {
        margin: 0 0 9px;
      }
      ul {
        margin: 0 0 12px 20px;
        padding: 0;
      }
      li {
        margin: 0 0 6px;
      }
      hr {
        height: 1px;
        margin: 18px 0;
        border: 0;
        background: #d9dfeb;
      }
      code {
        padding: 1px 4px;
        border-radius: 4px;
        background: #eef2f8;
        font-size: 12px;
      }
      .notice {
        margin-top: 18mm;
        padding: 12px 14px;
        border: 1px solid #e1e5ee;
        border-left: 4px solid #c49a49;
        color: #586277;
        font-size: 12px;
      }
      .footer {
        margin-top: 18mm;
        color: #7d8798;
        font-size: 11px;
      }
    </style>
  </head>
  <body>
    <section class="cover">
      <p class="kicker">CPA Do Zero a Aprovação</p>
      <h1>${escapeHtml(title)}</h1>
      <p>Material preparatório independente para CPA ANBIMA.</p>
    </section>
    <main>${body}</main>
    <section class="notice">
      Este material é preparatório e independente. Não é material oficial da ANBIMA e não garante aprovação.
    </section>
    <p class="footer">CPA Do Zero a Aprovação</p>
  </body>
</html>`;
}

fs.mkdirSync(htmlDir, { recursive: true });
fs.mkdirSync(pdfDir, { recursive: true });

if (!fs.existsSync(chromePath)) {
  throw new Error(`Chrome não encontrado em: ${chromePath}`);
}

for (const [mdName, pdfName, title] of docs) {
  const markdown = fs.readFileSync(path.join(sourceDir, mdName), "utf8");
  const htmlPath = path.join(htmlDir, mdName.replace(/\.md$/, ".html"));
  const pdfPath = path.join(pdfDir, pdfName);
  fs.writeFileSync(htmlPath, pageHtml(title, markdownToHtml(markdown)));

  const result = spawnSync(
    chromePath,
    [
      "--headless",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--print-to-pdf=${pdfPath}`,
      `file://${htmlPath}`,
    ],
    { stdio: "inherit" }
  );

  if (result.status !== 0) {
    throw new Error(`Falha ao gerar ${pdfName}`);
  }
}

console.log(`PDFs gerados em ${pdfDir}`);
