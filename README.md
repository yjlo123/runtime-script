<div align="center">
  <a href="https://runtime.siwei.dev/" target="_blank">
    <img src="https://siwei.dev/doc/runtime.png" alt="Runtime Script Logo" width="150" height="150"></img>
  </a>
</div>

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

[Leetcode 1. Two Sum](https://runtime.siwei.dev/?src=leetcode1)  
[Leetcode 20. Valid Parentheses](https://runtime.siwei.dev/?src=leetcode20)  
[Leetcode 21. Merge Two Sorted Lists](https://runtime.siwei.dev/?src=leetcode21)  
[Leetcode 136. Single Number](https://runtime.siwei.dev/?src=leetcode136)  
[Leetcode 231. Power of Two](https://runtime.siwei.dev/?src=leetcode231)  
[Leetcode 344. Reverse String](https://runtime.siwei.dev/?src=leetcode344)  
[Leetcode 412. Fizz Buzz](https://runtime.siwei.dev/?src=leetcode412)  

[Digital Clock](https://runtime.siwei.dev/?src=clock)  
[Selection Sort](https://runtime.siwei.dev/?src=sort)  
[Brainfuck Interpreter](https://runtime.siwei.dev/?src=brain_fuck) 

## Language reference
```
let N V
prt V V*

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
key M N
del M V

# canvas
clr V*
drw V V V
pxl N V V

# misc
inp N
slp V
rnd N V V
tim N year|month|date|day|hour|minute|second|milli
prs N V

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
