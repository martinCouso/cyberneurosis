const path = require('path');
const fs = require('fs');
const vscode = require('vscode');


const removeStyles = ()=> {
  const appDir = path.dirname(vscode.env.appRoot);
  const base = path.join(appDir, 'app', 'out', 'vs', 'code');
  const electronBase = vscode.version < "1.70.0" ? "electron-browser" : "electron-sandbox";
  const workbenchFilename = vscode.version.startsWith("1.94") ? "workbench.esm.html" : "workbench.html";
  const htmlFile = path.join(base, electronBase, "workbench", workbenchFilename);
  try {
    let html = fs.readFileSync(htmlFile, "utf8");
    if (html.includes("neonmemories.js")) {
      html = html.replace(/\s*<!-- CUSTOM THEME -->\s*<script src="neonmemories\.js"><\/script>\s*\n?/, '');
      fs.writeFileSync(htmlFile, html, "utf8");

      const targetPath = path.join(base, electronBase, "workbench", "neonmemories.js");
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }

      vscode.window.showInformationMessage("Neon Memories: Neon Mode terminated. VS Code must reload to apply changes.", { title: "Reload" })
        .then(() => vscode.commands.executeCommand("workbench.action.reloadWindow"));
    } else {
      vscode.window.showInformationMessage("Neon Memories: Neon Mode was not initiated.");
    }
  } catch (e) {
    vscode.window.showErrorMessage("Neon Memories: Error terminating Neon Mode: either the mode was too strong or it's related to the following error: " + e.message);
  }
}


function activate(context) {
  console.info('Neon Memories extension is now active!'); // Debugging

  const config = vscode.workspace.getConfiguration("neonmemories");
  const disableGlow = !!config.disableGlow;

  const glowCssPath = path.join(__dirname, 'css', 'glow.css');
  const noGlowCssPath = path.join(__dirname, 'css', 'no-glow.css');
  const cssWithGlow = fs.readFileSync(glowCssPath, 'utf8');
  const cssWithoutGlow = fs.readFileSync(noGlowCssPath, 'utf8');

  const appDir = path.dirname(vscode.env.appRoot);
  const base = path.join(appDir, 'app', 'out', 'vs', 'code');
  const electronBase = vscode.version < "1.70.0" ? "electron-browser" : "electron-sandbox";
  const workbenchFilename = vscode.version.startsWith("1.94") ? "workbench.esm.html" : "workbench.html";
  const htmlFile = path.join(base, electronBase, "workbench", workbenchFilename);

  let disposable = vscode.commands.registerCommand('neonmemories.initiateNeonMode', function () {
    console.log('Neon Memories: Initiate Neon Mode command activated!');

    const templatePath = path.join(__dirname, 'js', 'theme_template.js');
    let jsTemplate = fs.readFileSync(templatePath, 'utf8');

    jsTemplate = jsTemplate.replace(/\[DISABLE_GLOW\]/g, disableGlow);
    jsTemplate = jsTemplate.replace(/\[CSS_WITH_GLOW\]/g, cssWithGlow.replace(/(\r\n|\n|\r)/gm, ''));
    jsTemplate = jsTemplate.replace(/\[CSS_WITHOUT_GLOW\]/g, cssWithoutGlow.replace(/(\r\n|\n|\r)/gm, ''));

    const outputPath = path.join(__dirname, 'js', 'neonmemories.js');
    const targetPath = path.join(base, electronBase, "workbench", "neonmemories.js");
    fs.writeFileSync(outputPath, jsTemplate, 'utf8');
    fs.copyFileSync(outputPath, targetPath);  

    try {
      let html = fs.readFileSync(htmlFile, "utf8");

      if (!html.includes("neonmemories.js")) {
        html = html.replace(/\<\/html\>/g, `  <!-- CUSTOM THEME -->\n  <script src="neonmemories.js"></script>\n</html>`);
        fs.writeFileSync(htmlFile, html, "utf8");

        vscode.window.showInformationMessage("Neon Memories: Initiating Neon Mode. The editor must reload to apply changes.", { title: "Reload" })
          .then(() => vscode.commands.executeCommand("workbench.action.reloadWindow"));
      } else {
        vscode.window.showInformationMessage("Neon Memories: Mode was already activated, check your memory module. Reload to refresh settings.", { title: "Reload" })
          .then(() => vscode.commands.executeCommand("workbench.action.reloadWindow"));
      }
    } catch (e) {
      vscode.window.showErrorMessage("Neon Memories: Error while initianing Neon Mode: " + e.message);
    }
  }); 

  context.subscriptions.push(disposable);


  let disposableTerminate = vscode.commands.registerCommand('neonmemories.terminateNeonMode', function () {
    console.info('Neon Memories: Terminate Neon Mode command executed.');
    try {
      let html = fs.readFileSync(htmlFile, "utf8");
      if (html.includes("neonmemories.js")) {
        html = html.replace(/\s*<!-- CUSTOM THEME -->\s*<script src="neonmemories\.js"><\/script>\s*\n?/, '');
        fs.writeFileSync(htmlFile, html, "utf8");
  
        const targetPath = path.join(base, electronBase, "workbench", "neonmemories.js");
        if (fs.existsSync(targetPath)) {
          fs.unlinkSync(targetPath);
        }
  
        vscode.window.showInformationMessage("Neon Memories: Neon Mode terminated. The editor must reload to apply changes.", { title: "Reload" })
          .then(() => vscode.commands.executeCommand("workbench.action.reloadWindow"));
      } else {
        vscode.window.showInformationMessage("Neon Memories: Neon Mode was not initiated.");
      }
    } catch (e) {
      vscode.window.showErrorMessage("Neon Memories: Error terminating Neon Mode: either the mode was too strong or it's related to the following error: " + e.message);
    } 
  });
  context.subscriptions.push(disposableTerminate);
} 

exports.activate = activate;

function deactivate() {
  console.info('Neon Memories: Extension is being deactivated');
  //removeStyles();
}


function uninstall() {
  console.info('Neon Memories: Extension is being uninstalled.');
  //removeStyles();
}

module.exports = { activate, deactivate };
