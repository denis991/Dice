# Source and build directories
SRC_DIR = src
BUILD_DIR = build

# Ignore files
IGNORE_CSS = \
	vendor/*.css

IGNORE_HTML = \
	vendor/*.html

IGNORE_JS = \
	vendor/*.js

# HTML minification options
HTML_MIN_OPTS = --collapse-whitespace --remove-comments --remove-optional-tags

# External tools
HTMLMIN = npx html-minifier
JSOBF = npx javascript-obfuscator
