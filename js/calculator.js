import { Expression } from "./expression.js";

export class Calculator {
    expression;

    constructor() {
        this.expression = new Expression("0");
    }

    handleClick(chars) {
        if (this.expression.text === "0") this.expression.text = "";

        this.expression = new Expression(this.expression.text + chars);
    }

    getText() {
        return this.expression.text;
    }

    clear() {
        this.expression = new Expression("0");
    }

    calculate(){
        let value;
        try{
            value = this.expression.getValue();
        }catch (e) {
            value = "Erreur..."
        }
        this.expression = new Expression(value.toString());
        return value;
    }
}
