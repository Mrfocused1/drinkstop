#!/usr/bin/env python3
"""Verification harness for the DRINK STOP site.

Two independent checks, both of which must pass before the site ships:

  refs     every asset a page points at actually exists on disk
  residue  no naming from the original site mirror survives anywhere

Run from the site root:

    python3 docs/verify.py            # both checks
    python3 docs/verify.py refs
    python3 docs/verify.py residue
"""
import os
import re
import sys
import posixpath

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'.git', 'node_modules', '.vercel', 'docs'}
TEXT_EXT = {'.html', '.css', '.js', '.json', '.xml', '.txt', '.md'}

# Vendored libraries are third-party and minified; their internal strings are not
# ours to police, and their template literals produce false positives.
VENDOR = ('cdn.jsdelivr.net/', 'cdn.plyr.io/', 'unpkg.com/', 'static.addtoany.com/')


def walk(exts=None):
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            path = os.path.join(dirpath, name)
            if exts is None or os.path.splitext(name)[1].lower() in exts:
                yield path


def rel(path):
    return os.path.relpath(path, ROOT)


# --------------------------------------------------------------------------- refs

# src="…", href="…", poster="…", data-src="…", and CSS url(…)
ATTR_RE = re.compile(r"""\b(?:src|href|poster|data-src|srcset)\s*=\s*["']([^"']+)["']""", re.I)
URL_RE = re.compile(r"""url\(\s*['"]?([^'")]+)['"]?\s*\)""", re.I)


def is_external(target):
    return (
        target.startswith(('http://', 'https://', '//', 'data:', 'mailto:', 'tel:', '#', 'javascript:'))
        or not target.strip()
    )


def check_refs():
    broken = []
    checked = 0

    for path in walk({'.html', '.css', '.js'}):
        relpath = rel(path)
        if relpath.startswith(VENDOR):
            continue
        text = open(path, encoding='utf-8', errors='ignore').read()
        base = os.path.dirname(path)

        targets = []
        if path.endswith(('.html', '.css')):
            targets += ATTR_RE.findall(text)
            targets += URL_RE.findall(text)

        for target in targets:
            # srcset carries "path 800w, path 1200w" — take each path
            for piece in (target.split(',') if ' ' in target and ',' in target else [target]):
                t = piece.strip().split(' ')[0]
                if is_external(t):
                    continue
                if '${' in t or '{{' in t:      # template placeholder, not a real path
                    continue
                t = t.split('?')[0].split('#')[0]
                # Values assigned at runtime by inline JS (src=blob, src=d.desktop,
                # href=%23n) are not paths. A real one has a directory separator or
                # a recognisable file extension.
                if '/' not in t and not re.search(r'\.[a-z0-9]{2,5}$', t, re.I):
                    continue
                if re.fullmatch(r'[A-Za-z_$][\w$]*\.[A-Za-z_$][\w$]*', t):
                    continue               # bare JS member expression, e.g. d.mobile
                resolved = os.path.normpath(os.path.join(base, t))
                checked += 1
                if not os.path.exists(resolved):
                    broken.append((relpath, t))

    print(f"refs: checked {checked} references")
    if broken:
        print(f"  BROKEN: {len(broken)}")
        for src, target in sorted(set(broken)):
            print(f"    {src}  ->  {target}")
        return False
    print("  all resolve")
    return True


# ------------------------------------------------------------------------ residue

# Naming inherited from the original site mirror. Each must be absent.
RESIDUE = {
    'pley':            r'pley',
    'by-ney':          r'by[-_.]?ney\b',
    'neymar':          r'neymar',
    'santos':          r'santos',
    'translatepress':  r'translatepress',
    'adieu':           r'adieu',
    'compromisso':     r'compromisso',
    'fechar':          r'fechar',
    'telefone':        r'telefone',
    'sobre (pt)':      r'#sobre\b|id="sobre"|["\']sobre["\']',
    'fale-conosco':    r'fale-conosco',
    'onde-encontrar':  r'onde-encontrar',
    'old slugs':       r'\b(mangofunk|tropisamba|greengroov|rumbaclart1|summerset)\b',
    'wp plugins':      r'wp-content/plugins|wp-includes',
}


def check_residue():
    hits = {}
    for path in walk(TEXT_EXT):
        relpath = rel(path)
        if relpath.startswith(VENDOR) or relpath.startswith('fonts/OFL'):
            continue
        text = open(path, encoding='utf-8', errors='ignore').read()
        for label, pattern in RESIDUE.items():
            for m in re.finditer(pattern, text, re.I):
                line = text[:m.start()].count('\n') + 1
                snippet = text.splitlines()[line - 1].strip()[:110]
                hits.setdefault(label, []).append(f"{relpath}:{line}  {snippet}")

    # Directory and file names carry the naming too.
    for path in walk():
        relpath = rel(path)
        if relpath.startswith(VENDOR):
            continue
        for label, pattern in RESIDUE.items():
            if re.search(pattern, relpath, re.I):
                hits.setdefault(label + ' (path)', []).append(relpath)

    if hits:
        total = sum(len(v) for v in hits.values())
        print(f"residue: {total} occurrence(s) across {len(hits)} categor(ies)")
        for label, found in sorted(hits.items()):
            print(f"  {label}: {len(found)}")
            for f in sorted(set(found))[:6]:
                print(f"    {f}")
            if len(set(found)) > 6:
                print(f"    … and {len(set(found)) - 6} more")
        return False
    print("residue: clean")
    return True


if __name__ == '__main__':
    which = sys.argv[1] if len(sys.argv) > 1 else 'all'
    ok = True
    if which in ('all', 'refs'):
        ok &= check_refs()
    if which in ('all', 'residue'):
        ok &= check_residue()
    sys.exit(0 if ok else 1)
