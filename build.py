#!/usr/bin/env python3
"""Inline CSS and JS into one self-contained HTML file."""
import pathlib, sys
src = pathlib.Path(__file__).parent / 'src'
out = pathlib.Path(__file__).parent / 'dist'
out.mkdir(exist_ok=True)
files = ['data-exams.js', 'data-services.js'] + sorted(f.name for f in src.glob('data-services-*.js')) + ['data-content.js'] + sorted(f.name for f in src.glob('data-content-*.js')) + ['app.js', 'exam.js']
js = '\n'.join((src / f).read_text() for f in files)
if '</script' in js.lower():
    sys.exit('JS contains a closing script tag; escape it.')
html = (src / 'template.html').read_text().replace('/*__CSS__*/', (src / 'styles.css').read_text()).replace('/*__JS__*/', js)
(out / 'aws-handbook.html').write_text(html)
(out / 'bundle.js').write_text(js)
print('built', len(html), 'bytes')
