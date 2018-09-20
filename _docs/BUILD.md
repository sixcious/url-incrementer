# Build

Use Notepad++ 
1. Replace multi-line comments: /\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+/
With empty string:

2. Replace single-line comments: \s+//.*
With empty string:

3. Replace console.log statements: ^\s*console.log.*$
With empty string:

4. Replace multiple empty lines: ^(\s*\r\n){2,}
With one empty line: \r\n

5. Add multi-line comment at top of each file