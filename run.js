const executor = require("./src/executer.js");
const parser= require("./src/parser.js");
const evaluator = require("./src/evaluator.js");
const fs = require('fs');
const path = require('path');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
let inputCallback = ()=>{}
readline.on('line', (line) => {
    inputCallback(line.trim());
})

let runtime = executor.runtimeExecuter();
runtime.config(
    parser.runtimeParser(),
    evaluator.runtimeEvaluator(),
    null,
    {
        Write: (t) => {process.stdout.write(t);},
        Input: (callback) => {
            inputCallback = callback;
            readline.prompt();
        }
    },
    null,
    {},
    {inBrowser:false}
);

if (process.argv.length < 3) {
    console.error('Excepted an input file as an argument.');
    process.exit(1);
}

let fileName = process.argv[2];
let src = fs.readFileSync(path.resolve(__dirname, fileName), 'utf8')

runtime.executeAll({}, src, ()=>{
    readline.close();
});
