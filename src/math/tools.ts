import { tool } from "llamaindex";
import { z } from "zod";

export const sumNumbers = tool({
    name: "sumNumbers",
    description: "Use this function to sum two numbers",
    parameters: z.object({
        a: z.number().describe("The first number"),
        b: z.number().describe("The second number"),
    }),
    execute: ({ a, b }: { a: number; b: number }) => `${a + b}`,
});

export const subtractNumbers = tool({
    name: "subtractNumbers",
    description: "Use this function to subtract two numbers",
    parameters: z.object({
        a: z.number().describe("The number to subtract from"),
        b: z.number().describe("The number to subtract"),
    }),
    execute: ({ a, b }: { a: number; b: number }) => `${a - b}`,
});

export const multiplyNumbers = tool({
    name: "multiplyNumbers",
    description: "Use this function to multiply two numbers",
    parameters: z.object({
        a: z.number().describe("The first number"),
        b: z.number().describe("The second number"),
    }),
    execute: ({ a, b }: { a: number; b: number }) => `${a * b}`,
});

export const divideNumbers = tool({
    name: "divideNumbers",
    description: "Use this function to divide two numbers",
    parameters: z.object({
        a: z.number().describe("The dividend a to divide"),
        b: z.number().describe("The divisor b to divide by"),
    }),
    execute: ({ a, b }: { a: number; b: number }) => {
        if (b === 0) return "Error: Division by zero is not allowed";
        return `${a / b}`;
    },
});

export const powerNumbers = tool({
    name: "powerNumbers",
    description: "Use this function to raise a number to a power",
    parameters: z.object({
        base: z.number().describe("The base number"),
        exponent: z.number().describe("The exponent"),
    }),
    execute: ({ base, exponent }: { base: number; exponent: number }) => `${Math.pow(base, exponent)}`,
});

export const squareRoot = tool({
    name: "squareRoot",
    description: "Use this function to calculate the square root of a number",
    parameters: z.object({
        number: z.number().describe("The number to find the square root of"),
    }),
    execute: ({ number }: { number: number }) => {
        if (number < 0) return "Error: Cannot calculate square root of negative number";
        return `${Math.sqrt(number)}`;
    },
});

export const modulo = tool({
    name: "modulo",
    description: "Use this function to find the remainder when dividing two numbers",
    parameters: z.object({
        a: z.number().describe("The dividend"),
        b: z.number().describe("The divisor"),
    }),
    execute: ({ a, b }: { a: number; b: number }) => {
        if (b === 0) return "Error: Division by zero is not allowed";
        return `${a % b}`;
    },
}); 