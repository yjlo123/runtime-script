# Runtime Script
An assembly-like programming language.

## Playground
https://runtime.siwei.dev

## Tutorial
https://siwei.dev/doc/runtime

## Examples
[Game: Snake](https://runtime.siwei.dev/?src=snake)  
[Game: Flappy Bird](https://runtime.siwei.dev/?src=bird)  
[Game: Sliding Puzzle](https://runtime.siwei.dev/?src=puzzle)  
[Game: Sokoban](https://runtime.siwei.dev/?src=sokoban)  

[Leetcode 20. Valid Parentheses](https://runtime.siwei.dev/?src=leetcode20)  
[Leetcode 21. Merge Two Sorted Lists](https://runtime.siwei.dev/?src=leetcode21)  

[Digital Clock](https://runtime.siwei.dev/?src=clock)  
[Selection Sort](https://runtime.siwei.dev/?src=sort)  
[Brainfuck Interpreter](https://runtime.siwei.dev/?src=brain_fuck) 

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
prs V

# advanced
ife V V
ifg V V
els
fin

def F
ret
end
cal F
```
```
N: variable name
V: variable reference ($VR)
   or value (int|str|[]|{})
S: list|str $VR
M: map $VR
L: label
F: function name
```
