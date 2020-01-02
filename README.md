# Runtime Script
An assembly-like programming language.

## Playground
https://runtime.siwei.dev

## Tutorial
https://siwei.dev/doc/runtime

## Examples
[Snake](https://runtime.siwei.dev/?src=snake)  
[Plappy Bird](https://runtime.siwei.dev/?src=bird)  
[Sliding Puzzle](https://runtime.siwei.dev/?src=puzzle)  
[Digital Clock](https://runtime.siwei.dev/?src=clock)  
[Selection Sort](https://runtime.siwei.dev/?src=sort)  

## Language reference
```
let N V
prt V

# data type
int N V
str N V
typ N V

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

# misc
inp N
slp V
rnd N V V
tim N year|month|date|day|hour|minute|second|milli
i2a N V
a2i N V

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
