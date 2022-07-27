const http = require('http');
const fs = require('fs');
const path = require('path');

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
    } else {
        basePath = createPath(`./${req.url}`);
    }

    mimeType = reqUrl[`${path.extname(basePath)}`].contType;

    res.setHeader('Content-Type', mimeType);

    fs.readFile(basePath, (err, data) => {
        if (err){
            console.log(err);
            res.end();
        } else {
            res.write(data);
            res.end();
        }
    });
});

server.listen(PORT, 'localhost', (error)=>{
    if (error){
        console.log(error);
    }
});