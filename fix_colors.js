const fs = require('fs');
const files = [
  'src/pages/StudentHome.tsx',
  'src/layouts/StudentDashboardLayout.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/1px solid #FDE68A/g, '1px solid var(--accent-border)');
  content = content.replace(/2px solid #FDE68A/g, '2px solid var(--accent-border)');
  content = content.replace(/1px solid #FEF3C7/g, '1px solid var(--border-color)');
  content = content.replace(/1px solid #E5E7EB/g, '1px solid var(--border-color)');
  content = content.replace(/color: '#78350F'/g, "color: 'var(--accent-text)'");
  content = content.replace(/color: '#B45309'/g, "color: 'var(--accent-muted)'");
  content = content.replace(/color: '#92400E'/g, "color: 'var(--accent-muted)'");
  content = content.replace(/background: '#FFFBEB'/g, "background: 'var(--icon-bg)'");
  content = content.replace(/color: '#D97706'/g, "color: 'var(--icon-color)'");
  content = content.replace(/stroke: '#FDE68A'/g, "stroke: 'var(--accent-border)'");
  content = content.replace(/fill: '#92400E'/g, "fill: 'var(--accent-muted)'");
  content = content.replace(/fill: '#B45309'/g, "fill: 'var(--accent-muted)'");
  content = content.replace(/boxShadow: '0 2px 8px rgba\(245,158,11,0\.08\)'/g, "boxShadow: 'var(--card-shadow)'");
  fs.writeFileSync(file, content);
}
