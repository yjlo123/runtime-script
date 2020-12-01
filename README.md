<div align=center>
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
[Leetcode 122. Best Time to Buy and Sell Stock II](https://runtime.siwei.dev/?src=leetcode122)  
[Leetcode 136. Single Number](https://runtime.siwei.dev/?src=leetcode136)  
[Leetcode 231. Power of Two](https://runtime.siwei.dev/?src=leetcode231)  
[Leetcode 344. Reverse String](https://runtime.siwei.dev/?src=leetcode344)  
[Leetcode 412. Fizz Buzz](https://runtime.siwei.dev/?src=leetcode412)  

[Digital Clock](https://runtime.siwei.dev/?src=clock)  
[Selection Sort](https://runtime.siwei.dev/?src=sort)  

[Brainfuck Interpreter](https://runtime.siwei.dev/?src=brain_fuck)  
[Runtime Script Interpreter](https://runtime.siwei.dev/?src=runtime_script)  

## Works
[倉庫番](https://siwei.dev/app/sokoban/): A sokoban game  
[Rundis](https://siwei.dev/app/rundis/): A mock Redis CLI  

## Editor
[Online Editor](https://runtime.siwei.dev)  
[Visual Studio Code Extension](https://marketplace.visualstudio.com/items?itemName=yjlo123.runtime)  

## Blog
[#runtime_script](https://blog.siwei.dev/tags/runtime-script/)

## Other implementations
[Runtime Go](https://github.com/yjlo123/runtime-go)  
[Runtime V](https://github.com/yjlo123/runtime-v)  

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
psh S V [V..]
pop S N
pol S N
put S I V
get S I N

put M V V
get M V N
key M N
del M V

len S/M N

# canvas
clr V*
drw V V V
pxl N V V

# misc
inp N
slp V
rnd N V V
tim N year|month|date|day|hour|minute|second|milli|now
prs N V
lod V N
sav V V

# if-else
ife V V
ifg V V
els
fin

# for-loop
for N V
nxt

# function
def F
ret V*
end
cal F
```
```
N: variable name
V: variable reference ($VR)
   or value (int|str|[]|{})
S: list|str $VR
M: map $VR
I: int or int $VR
L: label
F: function name
```
