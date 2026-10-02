/* The grown-ups gate's sum (plan key 2r): two numbers in words, a two-digit one and a single one, so a young reader
   can't sound it out and a grown-up answers at a glance. No birth year. */
const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

export function numberWords(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : "");
  return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` and ${numberWords(n % 100)}` : ""}`;
}

export interface Sum {
  a: number;
  b: number;
  answer: number;
  words: string;
}

export function makeSum(rand: () => number = Math.random): Sum {
  const a = 21 + Math.floor(rand() * 69); // 21 to 89
  const b = 3 + Math.floor(rand() * 7); // 3 to 9
  return { a, b, answer: a + b, words: `${numberWords(a)} plus ${numberWords(b)}?` };
}

export const HOLD_MS = 3000;
export const TRIES = 3;
