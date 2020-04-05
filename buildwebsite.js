const { log,
    walkSync,
    ensureDirectoryExistence,
    processIncludes } = require('./utils');
const fs = require('fs-extra');
const sitemap = require('sitemap');

const developmentEnvironment = process.argv.length > 2 && process.argv[2].toLowerCase() === 'dev';

log('Building lasperduta.com', true);
var ts = new Date().getTime();

log('Cleaning up dist', true);
fs.removeSync('./dist');
fs.mkdirSync('./dist');

function copyAssets() {
    log('Copying files', true);
    fs.copySync('./src/assets/', './dist/assets');
    log('...done.');
    log('');
}
copyAssets();

function addTimestamps(content, path) {
    content = content.replace(/lasperduta.css/g, 'lasperduta.css?' + ts);
    return content;
}

function processHTMLContent(content, path)
{
    var content = processIncludes(content);
    content = addTimestamps(content, path);
    return content;
}

function processHTMLs(singlePath)
{
    log('Processing HTML files', true);
    var files = walkSync('./src/content/');
    var counter = 1;
    if (singlePath) {
        files = [singlePath];
    }
    files.filter(file => file.indexOf('.html') != -1).map(function(path) {
        log(counter+": "+path);
        var content = fs.readFileSync(path, 'utf8');
        content = processHTMLContent(content, path);
        var distPath = path.replace(/src\/content/, 'dist');
        ensureDirectoryExistence(distPath);
        fs.writeFileSync(distPath, content, { encoding:'utf8'});
        counter++;
    })
    log('...done.');
    log('');
}
processHTMLs();

function createSitemap()
{
    log('Creating sitemap', true);

    var files = walkSync('./dist/');
    files = files.filter(file => file.indexOf('.html') != -1).map(function(name) { return { url: name.replace(/dist/, '').replace(/index\.html/, '') }; });
    var map = sitemap.createSitemap({
        hostname: 'https://lasperduta.com',
        cacheTime: 600000,
        urls: files
    });
    fs.writeFileSync('./dist/sitemap.xml', map.toString(), { encoding:'utf8' });
    log('...done.');
    log('');
}
createSitemap();

var duration = new Date().getTime() - ts;
log('All done, in '+Math.round(duration/100)/10+'s');

if (developmentEnvironment) {
    log('Dev mode. Starting web server on ./dist/');

    var connect = require('connect');
    var serveStatic = require('serve-static');
    connect().use(serveStatic('./dist')).listen(8080, function() { log('Server running on 8080...'); });

    //add watches
    log("Starting watchers...");

    var fsTimeout;

    fs.watch('./src', {recursive:true}, function(eventType, filename) {
        if (fsTimeout) {
            clearTimeout(fsTimeout);
        }
        fsTimeout = setTimeout(function() {
            log(eventType+" detected: "+filename);
            if (filename) {
                if (filename.startsWith('assets')) {
                    copyAssets();
                }
                if (filename.endsWith('.inc')) {
                    clearPathListsCache();
                    processHTMLs();
                    processWordpressThemeFiles();
                }
                if (filename.endsWith('.html')) {
                    clearPathListsCache();
                    processHTMLs();
                    if (eventType !== 'change') {
                        createSitemap();
                    }
                }
            }
         }, 2000);
    });
}
