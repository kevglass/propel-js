// List copied from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math
// Patching done according to https://www.ecma-international.org/wp-content/uploads/ECMA-262.pdf point 21.3.2 (Function properties of the Math Object)

export const MATH_FUNCTIONS: Exclude<
  keyof typeof Math,
  // Constants, so not patching these
  | "Math"
  | "E"
  | "LN10"
  | "LN2"
  | "LOG10E"
  | "LOG2E"
  | "PI"
  | "SQRT1_2"
  | "SQRT2"
  // To comply with typescript we also exclude Symbols.
  | Symbol
>[] = [
  // "Math"
  // "E"
  // "LN10"
  // "LN2"
  // "LOG10E"
  // "LOG2E"
  // "PI"
  // "SQRT1_2"
  // "SQRT2"
  // "abs",
  "acos",
  "acosh",
  "asin",
  "asinh",
  "atan",
  "atan2",
  "atanh",
  "cbrt",
  // "ceil",
  // "clz32",
  "cos",
  "cosh",
  "exp",
  "expm1",
  // "floor",
  // "fround", -- we use fround for rounding
  "hypot",
  // "imul", -- patching imul breaks most of other math. Tests inside random/array sort start to fail
  "log",
  "log10",
  "log1p",
  "log2",
  // "max",
  // "min",
  "pow",
  // "random", -- patched every time we execute logic
  // "round",
  // "sign",
  "sin",
  "sinh",
  "sqrt",
  "tan",
  // "tanh",
  // "trunc",
]

function crossBrowserPrecision(math: Math, fn: Function) {
  return (...args: unknown[]) => {
    return math.fround(fn.apply(math, args))
  }
}

// Calling math patching will happen in logicRunner & browser entry point.
// But due to devUI using both at once, we make sure that we don't apply math patching multiple times on the same context.
export function patchMathPrecision() {
  // Math was already patched, skip patching it again.
  // @ts-ignore
  if (globalThis.Math.__SDK_PRECISION_SET__) {
    return
  }

  MATH_FUNCTIONS.forEach((fnName) => {
    globalThis.Math[fnName] = crossBrowserPrecision(
      globalThis.Math,
      globalThis.Math[fnName]
    )
  })

  // @ts-ignore
  globalThis.Math.__SDK_PRECISION_SET__ = true
}
