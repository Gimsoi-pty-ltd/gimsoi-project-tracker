# Global Agent Identity

## ESM-Only Rule
All JavaScript files use ESM exclusively. `import`/`export` only.
Never write `require()` or `module.exports`. Never suggest CJS syntax.
Relative imports must include the file extension (e.g. `./utils/helpers.js`).

## Error Handling
Every `async` function must have a `try/catch`. Errors must be re-thrown
with context — never swallowed silently. No empty catch blocks. No
`console.error` as a substitute for proper error propagation.

## Comment Style
Comments explain **why**, not what. The code explains what.
Write comments only when the reason is non-obvious from reading the code.
Never leave TODO comments without a linked issue or decision.

## No Hardcoded Credentials
No secrets, tokens, passwords, connection strings, or API keys in source files.
All credentials come from environment variables. No `.env` files committed to git.

## No Silent Failures
If an operation can fail, the failure must surface explicitly.
Return errors upward. Never return `null` or `undefined` to mask a failure.
