const fs = require('fs');
const path = require('path');

function removeComments(content) {
    // Remove multi-line comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');

    // Remove single-line comments that are on their own line
    // This matches: start-of-line, optional-whitespace, //, everything-else-on-line, newline
    content = content.replace(/^[ \t]*\/\/.*(?:\r?\n|$)/gm, '');

    // Remove trailing single-line comments (be careful with URLs)
    // We only remove if it's preceded by whitespace and not inside a string
    // A simpler approach for now to avoid breaking code:
    // content = content.replace(/[ \t]+\/\/.*$/gm, '');

    // Let's stick to the safer "whole line" comments for now as per "comment lines" request

    return content;
}

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const targetDirs = ['src', 'server'];

targetDirs.forEach(dir => {
    const fullPath = path.resolve(dir);
    if (!fs.existsSync(fullPath)) return;

    walk(fullPath, (filePath) => {
        if (filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.css')) {
            const content = fs.readFileSync(filePath, 'utf8');
            const newContent = removeComments(content);
            if (content !== newContent) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`Cleaned: ${filePath}`);
            }
        }
    });
});
