const core = require("@actions/core")
const path = require('path')
const fs = require("fs")

const resultado_cypress = core.getInput("resultado")

const success = "https://img.shields.io/badge/tested with-Cypress-04C38E.svg"
const failure = "https://img.shields.io/badge/test-failure-red"

let badge = resultado_cypress == "success" ? success : failure

fs.readFile("./README.md", 'utf-8', (err, data) => {
    if (err) throw err;
    let start = data.indexOf("<inicio>")
    let end = data.indexOf("<fin>")
    let newText = `RESULTADO DE LOS ÚLTIMOS TESTS: ${badge}`
    console.log(newText);
    let newData = data.substring(0, start) + newText + data.substring(end);
    fs.writeFile("./README.md", newData, 'utf8', (err) => {
        if (err) throw err;
        console.log("El README ha sido modificado");
    })
})


