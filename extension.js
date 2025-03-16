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
    if (html.includes("cyberneurosis.js")) {
      html = html.replace(/\s*<!-- CUSTOM THEME -->\s*<script src="cyberneurosis\.js"><\/script>\s*\n?/, '');
      fs.writeFileSync(htmlFile, html, "utf8");

      const targetPath = path.join(base, electronBase, "workbench", "cyberneurosis.js");
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }

      vscode.window.showInformationMessage("Cyberneurosis: Neon Mod removed. VS Code must reload to apply changes.", { title: "Reload" })
        .then(() => vscode.commands.executeCommand("workbench.action.reloadWindow"));
    } else {
      vscode.window.showInformationMessage("Cyberneurosis: Neon Mod was not implanted.");
    }
  } catch (e) {
    vscode.window.showErrorMessage("Cyberneurosis: Error terminating Neon Mod: either the mode was too strong or it's related to the following error: " + e.message);
  }
}


function activate(context) {
  console.info('Cyberneurosis extension is now active!'); // Debugging

  const config = vscode.workspace.getConfiguration("cyberneurosis");
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

  let disposable = vscode.commands.registerCommand('cyberneurosis.implantNeonMod', function () {

    const templatePath = path.join(__dirname, 'js', 'theme_template.js');
    let jsTemplate = fs.readFileSync(templatePath, 'utf8');

    jsTemplate = jsTemplate.replace(/\[DISABLE_GLOW\]/g, disableGlow);
    jsTemplate = jsTemplate.replace(/\[CSS_WITH_GLOW\]/g, cssWithGlow.replace(/(\r\n|\n|\r)/gm, ''));
    jsTemplate = jsTemplate.replace(/\[CSS_WITHOUT_GLOW\]/g, cssWithoutGlow.replace(/(\r\n|\n|\r)/gm, ''));

    const outputPath = path.join(__dirname, 'js', 'cyberneurosis.js');
    const targetPath = path.join(base, electronBase, "workbench", "cyberneurosis.js");
    fs.writeFileSync(outputPath, jsTemplate, 'utf8');
    fs.copyFileSync(outputPath, targetPath);  

    try {
      let html = fs.readFileSync(htmlFile, "utf8");

      if (!html.includes("cyberneurosis.js")) {
        html = html.replace(/\<\/html\>/g, `  <!-- CUSTOM THEME -->\n  <script src="cyberneurosis.js"></script>\n</html>`);
        fs.writeFileSync(htmlFile, html, "utf8");

        vscode.window.showInformationMessage("Cyberneurosis: Implanting Neon Mod. The editor must reload to apply changes.", { title: "Reload" })
          .then(() => vscode.commands.executeCommand("workbench.action.reloadWindow"));
      } else {
        vscode.window.showInformationMessage("Cyberneurosis: Mod was already implanted, check your memory module. Reload to refresh settings.", { title: "Reload" })
          .then(() => vscode.commands.executeCommand("workbench.action.reloadWindow"));
      }
    } catch (e) {
      vscode.window.showErrorMessage("Cyberneurosis: Error while implanting Neon Mod: " + e.message);
    }
  }); 

  context.subscriptions.push(disposable);


  let disposableRemove = vscode.commands.registerCommand('cyberneurosis.removeNeonMod', function () {
    console.info('Cyberneurosis: Remove Neon Mod command executed.');
    try {
      let html = fs.readFileSync(htmlFile, "utf8");
      if (html.includes("cyberneurosis.js")) {
        html = html.replace(/\s*<!-- CUSTOM THEME -->\s*<script src="cyberneurosis\.js"><\/script>\s*\n?/, '');
        fs.writeFileSync(htmlFile, html, "utf8");
  
        const targetPath = path.join(base, electronBase, "workbench", "cyberneurosis.js");
        if (fs.existsSync(targetPath)) {
          fs.unlinkSync(targetPath);
        }
  
        vscode.window.showInformationMessage("Cyberneurosis: Neon Mod removed. The editor must reload to apply changes.", { title: "Reload" })
          .then(() => vscode.commands.executeCommand("workbench.action.reloadWindow"));
      } else {
        vscode.window.showInformationMessage("Cyberneurosis: Neon Mod was not implanted.");
      }
    } catch (e) {
      vscode.window.showErrorMessage("Cyberneurosis: Error terminating Neon Mod: either the mode was too strong or it's related to the following error: " + e.message);
    } 
  });
  context.subscriptions.push(disposableRemove);
} 

exports.activate = activate;

function deactivate() {
  console.info('Cyberneurosis: Extension is being deactivated');
  //removeStyles();
}


function uninstall() {
  console.info('Cyberneurosis: Extension is being uninstalled.');
  //removeStyles();
}

module.exports = { activate, deactivate };
