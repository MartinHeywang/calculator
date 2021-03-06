/**
 * @class Expression
 *
 * This class represents a mathematical expression, such as 8 + 2, or cos(40).
 */
export class Expression {
    text;
    normalizedText;

    /**
     * Creates a new Expression by parsing the given text.
     *
     * @param {string} text the text to parse to an expression
     */
    constructor(text) {
        if (typeof text !== "string") {
            throw new Error(
                "Argument at pos 0 in Expression() must be of type string."
            );
        }

        this.text = text;
        this.normalizedText = normalizeExpression(new String(text));
    }

    isValid() {
        const valid = validateExpression(this.normalizedText);
        return valid;
    }

    getValue() {
        if (!this.isValid()) {
            throw new Error(`${this.text} is not a valid expression`);
        }

        if (this.normalizedText.match(`^[0-9\\.]+$`))
            return parseFloat(this.normalizedText);

        let destructured = destructureExpression(this);
        while (typeof destructured !== "number") {
            destructured = calculationStep(destructured);
        }
        return destructured;
    }
}

function validateExpression(expression) {
    /* This regex matches :
     * - letters (both uppercase and lowercase) (for functions such as cos(x)),
     * - digits,
     * - parentheses,
     * - and basics operators
     */
    let match = expression.match(`^[0-9a-zA-Z\\+\\-\\/\\*()\\.]+$`) ? true : false;
    if (!match) return false;

    const parenthesesCount = (expression.match(new RegExp("[()]", "g")) || [])
        .length;
    match = parenthesesCount % 2 === 0 ? true : false;

    return match ? true : false;
}

function normalizeExpression(expression) {
    // remove spaces
    let newExp = expression.replace(new RegExp(" ", "g"), "");
    // replace operators
    newExp = newExp.replace(new RegExp("×", "g"), "*");
    newExp = newExp.replace(new RegExp("÷", "g"), "/");
    // I know π like the back of my hand (I got all in mind)
    newExp = newExp.replace(new RegExp("π", "g"), "3.1415926535897932384626433832795");

    return newExp;
}

function destructureExpression(expression) {
    let nestingLevel = 0;
    let subText = "";

    const text = expression.normalizedText;
    const destructured = {
        subExps: [],
        operators: [],
    };

    for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);

        subText += char;

        if (char === "(") nestingLevel++;
        if (char === ")") nestingLevel--;

        if (nestingLevel !== 0) continue;
        if (!char.match(`[\\+\\-\\*\\/]`)) continue;

        /*
         * At this step, 'char' is a non-nested operator
         */

        // remove the operator itself
        subText = subText.substring(0, subText.length - 1);

        destructured.subExps.push(parseSubExpression(subText));
        destructured.operators.push(char);

        subText = "";
    }
    destructured.subExps.push(parseSubExpression(subText));
    return destructured;
}

function parseSubExpression(text) {
    // for negative numbers
    if (text === "") text = "0";

    if (text.charAt(0) === "(" && text.charAt(text.length - 1 === ")")) {
        const withoutParentheses = text.substring(1, text.length - 1);
        return new Expression(withoutParentheses);
    }

    return new Expression(text);
}

const operations = {
    "+": (term1, term2) => term1 + term2,
    "-": (term1, term2) => term1 - term2,
    "*": (factor1, factor2) => factor1 * factor2,
    "/": (factor1, factor2) => factor1 / factor2,
};

function calculationStep(destructuredExpression) {
    const exps = destructuredExpression.subExps;
    const operators = destructuredExpression.operators;
    const values = [];

    let result;
    let breakIndex;
    let operator;

    exps.forEach((exp) => {
        if (typeof exp === "object") {
            values.push(exp.getValue());
        } else if (typeof exp === "number") {
            values.push(exp);
        }
    });

    if (operators.includes("*") || operators.includes("/")) {
        let firstTimes = operators.indexOf("*");
        if (firstTimes === -1) firstTimes = Math.pow(10, 6); // should be out of range for my poor calculator

        let firstDivide = operators.indexOf("/");
        if (firstDivide === -1) firstDivide = Math.pow(10, 6);

        if (firstTimes < firstDivide) {
            breakIndex = firstTimes;
            operator = "*";
        } else {
            breakIndex = firstDivide;
            operator = "/";
        }
        const factors = [values[breakIndex], values[breakIndex + 1]];

        result = operations[operator](factors[0], factors[1]);
    } else if (operators.includes("+") || operators.includes("-")) {
        let firstAdd = operators.indexOf("+");
        if (firstAdd === -1) firstAdd = Math.pow(10, 6);

        let firstSubstract = operators.indexOf("-");
        if (firstSubstract === -1) firstSubstract = Math.pow(10, 6);

        if (firstAdd < firstSubstract) {
            breakIndex = firstAdd;
            operator = "+";
        } else {
            breakIndex = firstSubstract;
            operator = "-";
        }
        const terms = [values[breakIndex], values[breakIndex + 1]];

        result = operations[operator](terms[0], terms[1]);
    }

    destructuredExpression.subExps.splice(breakIndex, 2, result);
    destructuredExpression.operators.splice(breakIndex, 1);

    const returns = exps.length === 1 ? exps[0] : destructuredExpression;

    return returns;
}
