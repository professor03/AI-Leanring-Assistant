
const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('c:/Users/user/Desktop/aistudent/黃仁勳的藍圖_從人格特質到產業革命.pdf');

// pdf-parse might export a function directly or an object
const parse = pdf.default || pdf;

parse(dataBuffer).then(function (data) {
    console.log(data.text);
}).catch(err => {
    console.error(err);
});
