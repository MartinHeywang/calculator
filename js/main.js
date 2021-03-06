import { Calculator } from "./calculator.js";

const calculator = new Calculator();
const keys = document.querySelector(".calculator__keys");
const display = document.querySelector(".calculator__display");

const functions = {
    "=": (calculator) => {
        display.innerHTML = calculator.calculate();
        calculator.clear();
    },
    "C": (calculator) => {
        calculator.clear();
        refresh();
        console.clear();
    }
}


keys.addEventListener("click", event => {
    if(!event.target.closest("button")) return;

    const key = event.target;
    const value = key.getAttribute("data-value");

    if(Object.keys(functions).includes(value)){
        functions[value](calculator); // call the custom method
        return;
    }

    calculator.handleClick(value);
    refresh();
});

function refresh() {
    display.innerHTML = calculator.getText();
}