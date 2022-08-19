let { dest, series, src, task } = require('gulp');
let regex2json = require('gulp-regex-json');
let jsonCombine = require('gulp-jsoncombine');
let replace = require('gulp-replace');
let rename = require('gulp-rename');

const createTranslationTemplate = () => {
    const phrases = /(?<=tr`).*?(?=`)/g;

    return src('src//**//*.ts**')
        .pipe(regex2json({regex: phrases, file: 'template.json'}))
        .pipe(dest('./src/resources/translations/templates/'));
}

const createEnglishTranslation = () => {
    const replaceRE = /(".*?")\s*?:\s*?null,/g;

    return src('src//resources//translations/templates/template.json')
        .pipe(replace(replaceRE, (match, p1) => `${p1} :  ${p1},`))
        .pipe(rename('en.json'))
        .pipe(dest('./src/resources/translations/'));
}

const createTranslationFile = () => {
    const trLangRE = /(?<=\b)\w*?(?=.json)/;

    return src('src//resources//translations//*.json')
        .pipe(jsonCombine('translations.json', (data, meta) => {
            return Buffer.from(JSON.stringify(data));
        }))
        .pipe(dest('./src/resources/'));
};

exports.default = series(createTranslationTemplate, createEnglishTranslation, createTranslationFile);