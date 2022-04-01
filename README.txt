**1. Give three examples of Python programs that use binary operators and/or builtins from this PA, but have different behavior than your compiler. For each, write**

- **a sentence about why that is**
> `-abs(3)`: my parser cannot negate numbers obtained from functions
> `max(1,2,3)`: Python allows multiple parameters (>=2) in `max()` while my compiler only allows 2
> `pow(base=2,exp=2)`: Python allows keyword arguments while my compiler doesn't
> `x+3=1`: Python would report a syntax error but my compiler treats `x+3` as a variable and reports no error
> `(2+3)*2`: Python would give the right answer but my compiler gives a `ParseError` because it cannot handle parenthesis in binary operations

- **a sentence about what you might do to extend the compiler to support it**
> `-abs(3)`: allow things after a "Unary Minus Sign" to be expressions instead of just number literals
> `max(1,2,3)`: add new argument parsing logic and parameter length checks to safely allow variable length parameters for functions like `max()` and `min()`
> `pow(base=2,exp=2)`: extend the argument parsing function to allow expressions, including variables, number literals and assignments in parameters
> `x+3=1`: add new variable naming checks when parsing variable assignments
> `(2+3)*2`: modify `traverseExpr()` to correctly group and parse parenthesized expressions

**2. What resources did you find most helpful in completing the assignment?**
Yousef's OH Recording, [MDN web docs](https://developer.mozilla.org/en-US/docs/WebAssembly/Understanding_the_text_format) and [WebAssembly Specification](https://webassembly.github.io/spec/core/syntax/modules.html)

**3.  Who (if anyone) in the class did you work with on the assignment? (See collaboration below)**
Thanks to Yosef for his detailed tutorial on how to approach PA1.