const express = require('express');
const bodyparser = require('body-parser');
const multer = require('multer'); //multer npm-овский пак для реализации загрузок файлов
const path = require('path');
const { nextTick } = require('process');
const imagemin = require('imagemin'); // imagemin основной пак для компрессии 
const imageminPngquant = require('imagemin-pngquant');// pngquant для компрессии png файлов




const app = express();

app.use('/uploads',express.static(path.join(__dirname + '/uploads')));//задал серверу директорию куда буду грузить файлы
app.set('view engine','ejs');// использую ejs для рендера хтмл страницы

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'uploads');
    },
    filename:(req, file, cb)=>{
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));

    }
})
const upload = multer({
    storage: storage
})

app.get('/', (req, res)=>{  //первым рендерит index.ejs файл
    res.render('index.ejs');
})
app.post('/',upload.single('image'),(req, res)=>{ // здесь принимает пост запросом кнопку upload 
    const file = req.file;
    let ext;
    if(!file){                                    //проверка на наличие файла
        const error = new Error('Please upload a file');

        error.httpStatusCode = 404;  

        return next(error);
    }
    //res.send('File uploaded');
    if(file.mimetype === "image/png"){ //проверка на формат файла и вставка его значения для переменной ext
        ext = "png";
    }
    res.render('image.ejs',{url:file.path, name:file.filename, ext: ext}); // здесь после обработки пост запроса рендерит нам image.ejs файл


})

app.post('/compress/uploads/:name/:ext', async (req, res)=>{          //прием пост запроса из image.ejs
    const files = await imagemin(["uploads/" + req.params.name],{  //здесь задаются основные параметры как папка назначения и юзаемый плагин imageminPngquant
        destination: "result",
        plugins: [
            imageminPngquant({
                quality:[0.5,1] //здесь как раз можно задать насколько сильно сжать файл по его качеству в массиве два значения по типу minValue, maxValue
                                //исоходя от них происходит сжатие. можете поиграться со значениями, но вот это значение как раз сжимает файл в среднем 2х раза
            })
        ]
    });
    // res.send('File compressed');

    res.download(files[0].destinationPath); // высвечивает загрузку файла в браузере
})



const port = 5000;
app.listen(port,()=>{
    console.log(`server is listening on port ${port}`)
})