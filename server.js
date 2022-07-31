const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const sharp = require('sharp');

const PORT = 1111;

const server = http.createServer((req, res)=>{
    let basePath = '';
    let mimeType = '';
    let dirName = __dirname;

    const createPath = (page) => path.resolve(dirName, page);

    let reqUrl = {
        '.html': {
            contType: 'text/html'
        },
        '.ico':{
            contType: 'image/vnd.microsoft.icon'
        },
        '.js':{
            contType: 'text/javascript'
        },
        '.css':{
            contType: 'text/css'
        },
        '.png':{
            contType: 'image/png'
        },
        '.jpg':{
            contType: 'image/jpeg'
        },
        '.jpeg':{
            contType: 'image/jpeg'
        }
    }

    if ( req.url == '/' ){
        basePath = createPath('./index.html');
    } else if (req.url == '/upload'){
        console.log('upload request');
        let uploadDir = path.resolve(__dirname, './src/images/');
        let form = new formidable.IncomingForm({uploadDir: uploadDir});
        form.parse(req, (error, fields, file)=>{
            if (error) {
                console.log(error);
                res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
                res.end(String(err));
                return;
            }

            let filepath = file.fileupload.filepath;

            newpath = path.resolve(uploadDir, `${file.fileupload.originalFilename}`);

            fs.rename(filepath, newpath, ()=>{
                console.log('File Renamed');
            });

            sharp(newpath)
            .resize(75, 75)
            .jpeg()
            .toFile(path.resolve(uploadDir,`cropped_${file.fileupload.originalFilename}`), (err, info)=>{
                if (err){
                    console.log(err);
                } else {
                    console.log('File Croped');
                    res.write('Image File Uploaded and Cropped Successfuly!');
                    res.end();
                }
            });
        })
    } else {
        basePath = createPath(`./${req.url}`);
    }

    if (basePath){
        mimeType = reqUrl[`${path.extname(basePath)}`].contType;

        res.setHeader('Content-Type', mimeType);
    
        fs.readFile(basePath, (err, data) => {
            if (err){
                // console.log(err);
                res.end();
            } else {
                res.write(data);
                res.end();
            }
        });
    }
});

server.listen(PORT, 'localhost', (error)=>{
    if (error){
        console.log(error);
    }
});