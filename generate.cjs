const fs = require('fs');
const pages = ['Home', 'Shop', 'Product', 'Cart', 'Checkout', 'About', 'Contact'];
pages.forEach(p => {
  fs.mkdirSync('src/pages/' + p, { recursive: true });
  fs.writeFileSync('src/pages/' + p + '/' + p + '.jsx', `import React from 'react';\n\nconst ${p} = () => {\n  return (\n    <div>\n      <h1>${p} Page</h1>\n    </div>\n  );\n};\n\nexport default ${p};`);
});
const components = ['Navbar', 'Footer', 'Hero', 'Categories', 'ProductCard', 'Collections', 'Testimonials', 'Newsletter'];
components.forEach(c => {
  fs.mkdirSync('src/components/' + c, { recursive: true });
  fs.writeFileSync('src/components/' + c + '/' + c + '.jsx', `import React from 'react';\nimport './${c}.css';\n\nconst ${c} = () => {\n  return (\n    <div className="${c.toLowerCase()}">\n      ${c} Component\n    </div>\n  );\n};\n\nexport default ${c};`);
  fs.writeFileSync('src/components/' + c + '/' + c + '.css', `.${c.toLowerCase()} {}`);
});
