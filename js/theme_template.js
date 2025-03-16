(function () {
    const disableGlow = [DISABLE_GLOW];
  
    const cssWithGlow = `[CSS_WITH_GLOW]`;
    const cssWithoutGlow = `[CSS_WITHOUT_GLOW]`;
  
    const styleContent = disableGlow ? cssWithoutGlow : cssWithGlow;
  
    if (!document.querySelector('#custom-theme-styles')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'custom-theme-styles';
      styleTag.innerText = styleContent;
      document.body.appendChild(styleTag);
      console.log('Custom theme styles injected!');
    }
  })();