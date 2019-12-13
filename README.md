# Runtime Script
An assembly-like programming language.

## Playground
https://runtime.siwei.dev/

## Tutorial
https://siwei.dev/doc/runtime/

## Examples
https://runtime.siwei.dev/?src=snake
https://runtime.siwei.dev/?src=bird
https://runtime.siwei.dev/?src=puzzle

## Language reference
```
let N V
prt V
inp N

# arithmetic
add N V V
sub N V V
mul N V V
div N V V
mod N V V

# jump
jmp L
jeq V V L
jne V V L
jlt V V L
jgt V V L

# data structure
psh S V
pop S N
pol S N

put M V V
get M V N

# canvas
clr
drw V V V
pxl N V V

# sys
slp V
rnd N V V
tim N year|month|date|day|hour|minute|second|milli

# data type
int N V
str N V
typ N V

# advanced
ife V V
ifg V V
els
fin

def N
ret
end
cal F
```
```
N: variable name
V: variable reference ($VR)
   or value (int|str|[]|{})
S: list or str $VR
M: map $VR
L: label
F: function $VR
```
