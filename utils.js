const fs = require('fs');
const path = require('path');

function log(msg, isTitle) {
    const now = (new Date()).toLocaleTimeString('it-IT');
    console.log(now + " " + (isTitle ? msg.toUpperCase() : msg));
    if (isTitle) {
        var str = '';
        for (var i=0; i<msg.length; i++) {
            str += '-';
        }
        console.log(now + " " + str);
    }
}

const walkSync = function(dir, recursive) {
    if (recursive === undefined) {
        recursive = true;
    }
    try {
        return fs.readdirSync(dir).reduce((files, file) =>
        fs.statSync(path.join(dir, file)).isDirectory() && recursive ?
          files.concat(walkSync(path.join(dir, file), recursive)) :
          files.concat(path.join(dir, file)),
        []);
    } catch (e) {
        return [];
    }
}

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

function processIncludes(txt) {
    var matches = txt.match(/@@include\[[^]*?\]/g);
    for (var i in matches) {
        var match = matches[i];

        //parse the match
        var src = match.match(/'(.*)'/g);
        src = src[0].substring(1, src[0].length-1);

        var json = match.match(/{[^}]*}/g);
        if (json) {
            json = JSON.parse(json);
        }

        //Load the source
        var partial = fs.readFileSync('./src/partials/'+src, 'utf8');

        if (json) {
            //preprocess the partial with the json replacements
            for (var key in json) {
                partial = partial.replace(new RegExp('@@'+key, 'g'), json[key]);
            }
        }

        //clean up unused partials
        partial = partial.replace(/@@\w+/g, '');

        //put the partial in the txt
        txt = txt.replace(match, partial);
    }
    return txt;
}

module.exports = {
    log,
    walkSync,
    ensureDirectoryExistence,
    processIncludes
};
