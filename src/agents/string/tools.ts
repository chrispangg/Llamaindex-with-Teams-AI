import { tool } from "llamaindex";
import { z } from "zod";

export const toUpperCase = tool({
    name: "toUpperCase",
    description: "Convert a string to uppercase",
    parameters: z.object({
        text: z.string().describe("The text to convert to uppercase"),
    }),
    execute: ({ text }: { text: string }) => text.toUpperCase(),
});

export const toLowerCase = tool({
    name: "toLowerCase",
    description: "Convert a string to lowercase",
    parameters: z.object({
        text: z.string().describe("The text to convert to lowercase"),
    }),
    execute: ({ text }: { text: string }) => text.toLowerCase(),
});

export const capitalizeWords = tool({
    name: "capitalizeWords",
    description: "Capitalize the first letter of each word in a string",
    parameters: z.object({
        text: z.string().describe("The text to capitalize"),
    }),
    execute: ({ text }: { text: string }) => {
        return text.replace(/\b\w/g, (char) => char.toUpperCase());
    },
});

export const getStringLength = tool({
    name: "getStringLength",
    description: "Get the length of a string",
    parameters: z.object({
        text: z.string().describe("The text to measure"),
    }),
    execute: ({ text }: { text: string }) => `${text.length}`,
});

export const reverseString = tool({
    name: "reverseString",
    description: "Reverse the characters in a string",
    parameters: z.object({
        text: z.string().describe("The text to reverse"),
    }),
    execute: ({ text }: { text: string }) => text.split('').reverse().join(''),
});

export const extractSubstring = tool({
    name: "extractSubstring",
    description: "Extract a substring from a string using start and end positions",
    parameters: z.object({
        text: z.string().describe("The source text"),
        start: z.number().describe("The starting position (0-based)"),
        end: z.number().optional().describe("The ending position (optional, defaults to end of string)"),
    }),
    execute: ({ text, start, end }: { text: string; start: number; end?: number }) => {
        if (start < 0 || start >= text.length) {
            return "Error: Start position is out of bounds";
        }
        return text.substring(start, end);
    },
});

export const replaceText = tool({
    name: "replaceText",
    description: "Replace all occurrences of a substring with another string",
    parameters: z.object({
        text: z.string().describe("The source text"),
        searchFor: z.string().describe("The text to search for"),
        replaceWith: z.string().describe("The text to replace with"),
    }),
    execute: ({ text, searchFor, replaceWith }: { text: string; searchFor: string; replaceWith: string }) => {
        return text.replace(new RegExp(searchFor, 'g'), replaceWith);
    },
});

export const splitString = tool({
    name: "splitString",
    description: "Split a string into an array using a delimiter",
    parameters: z.object({
        text: z.string().describe("The text to split"),
        delimiter: z.string().describe("The delimiter to split by"),
    }),
    execute: ({ text, delimiter }: { text: string; delimiter: string }) => {
        return JSON.stringify(text.split(delimiter));
    },
});

export const trimWhitespace = tool({
    name: "trimWhitespace",
    description: "Remove leading and trailing whitespace from a string",
    parameters: z.object({
        text: z.string().describe("The text to trim"),
    }),
    execute: ({ text }: { text: string }) => text.trim(),
}); 