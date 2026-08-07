const fs = require('fs');

let layout = fs.readFileSync('src/layouts/StudentDashboardLayout.tsx', 'utf8');
layout = layout.replace(/backgroundColor: '#FFFDF7'/g, "backgroundColor: 'var(--bg-main)'");
fs.writeFileSync('src/layouts/StudentDashboardLayout.tsx', layout);

let home = fs.readFileSync('src/pages/StudentHome.tsx', 'utf8');
home = home.replace(/background: 'white'/g, "background: 'var(--bg-card)'");
home = home.replace(/color: '#1C1917'/g, "color: 'var(--text-main)'");
home = home.replace(/color: '#111827'/g, "color: 'var(--text-main)'");
home = home.replace(/color: '#374151'/g, "color: 'var(--text-muted)'");
home = home.replace(/color: '#6B7280'/g, "color: 'var(--text-muted)'");
home = home.replace(/border: '1px solid #E5E7EB'/g, "border: '1px solid var(--border-color)'");
home = home.replace(/borderBottom: '1px solid #E5E7EB'/g, "borderBottom: '1px solid var(--border-color)'");
home = home.replace(/borderBottom: '1px solid #F3F4F6'/g, "borderBottom: '1px solid var(--border-color)'");
home = home.replace(/background: '#F3F4F6'/g, "background: 'var(--bg-muted)'");

fs.writeFileSync('src/pages/StudentHome.tsx', home);
