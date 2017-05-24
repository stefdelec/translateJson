var request = require('request');
var translateFile = require("./translate");
const merge = require("./objectmerge");
var fs = require("fs");
var path = require('path')

var language = ["en", "es"];


var OPTION = {
    url: 'http://www.transltr.org/api/translate',
    proxy: "http://tools.mui.jcdecaux.com:3128",
    method: "POST",
    form: {
        "text": "Voir toutes les parcours thématiques",
        "from": "fr",
        "to": "en"
    }
}

let createForm = (text, originLanguage, targetLanguage) => {
    return {
        "text": text,
        "from": originLanguage,
        "to": targetLanguage
    }
}
let translateIt = (text, originLanguage, targetLanguage) => {
    option = merge.mergeDeep({}, OPTION);
    option.form = createForm(text, originLanguage, targetLanguage);
    return new Promise((resolve, reject) => {
        request(option, function(error, response, body) {
            resolve(body);
            reject(error)
        });
    })
}

let iterateOnJson = (jsonObj, originLanguage, TargetLanguage) => {
    let promiseAll = [];

    let jsonObjClone = merge.mergeDeep({}, jsonObj);

    let iterateInner = (jsonObj) => {
        for (let item in jsonObj) {
            if (typeof(jsonObj[item]) == "string") {
                let promise = translateIt(jsonObj[item], originLanguage, TargetLanguage).then(translatedWord => jsonObj[item] = JSON.parse(translatedWord).translationText).catch(error => console.log(error));
                promiseAll.push(promise);
            } else {
                iterateInner(jsonObj[item])
            }
        }
    }
    iterateInner(jsonObjClone);
    return Promise.all(promiseAll).then(data => {
        return jsonObjClone
    })
}

for (let lang of language) {
    iterateOnJson(translateFile, "fr", lang).then(value => {
        let fileTitle = lang;
        console.log(lang);
        fs.writeFile("C:/Users/delecroixs/Desktop/translator/" + fileTitle + ".json", JSON.stringify(value, null, 3),
            function(err) {
                if (err) {
                    return console.log(err);
                }
                console.log("The file was saved!", lang);
            })
    }).catch(data => console.log(data));
}