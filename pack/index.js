const fs = require('fs'), path = require("path");

// var filename = 'index.html.gz';
// var filename = 'style.css.gz';
const foldername = path.join(__dirname, "../build");
let dirCont = fs.readdirSync(foldername);
let files = dirCont.filter(function (elm) { return elm.match(/.*\.(gz)/ig); });

const hFileName = path.join(__dirname, "web_content.h");

var totalSize = 0;

fs.unlink(hFileName, function (err) {
    if (err) return console.log(err);
    console.log('file deleted successfully');
});

fs.appendFileSync(hFileName, "#include <Arduino.h>\n\n\n");

files.forEach((filename) => {
    let filepath = path.join(foldername, filename);
    const stats = fs.statSync(filepath)
    const fileSizeInBytes = stats.size
    totalSize += fileSizeInBytes;
    var c_string = `const char ${filename.replace(/\./g, "_").toUpperCase()}[] PROGMEM = {`;

    console.log(`file size: ${fileSizeInBytes}`);

    fs.open(filepath, 'r', function (status, fd) {
        if (status) {
            console.log(status.message);
            return;
        }
        var buffer = Buffer.alloc(fileSizeInBytes);
        fs.read(fd, buffer, 0, fileSizeInBytes, 0, function (err, num) {
            // console.log(buffer.toString('ascii', 0, num));
            for (let i = 0; i < buffer.length; i++) {
                c_string += buffer[i];
                if (i < buffer.length - 1)
                    c_string += ",";
            }
            c_string += "};\n\n";
            console.log(c_string);
            // fs.writeFileSync(hFileName)
            fs.appendFileSync(hFileName, c_string);

            console.log(`total size is ${totalSize} bytes`)
        });
    });
})
