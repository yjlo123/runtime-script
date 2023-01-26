<div align=center>
  <a href="https://runtime.siwei.dev/" target="_blank">
    <img src="https://siwei.dev/doc/runtime.png" alt="Runtime Script Logo" width="150" height="150"></img>
  </a>
</div>

# Runtime Script
An assembly-like programming language.

```ruby
def hello
 let _names $0
 #loop
 pol $_names _name
 jeq $_name $nil done
 add _msg 'Hello ' $_name
 prt $_msg
 jmp loop
 #done
 ret
end

let names []
psh $names 'World' 'yjlo'
cal hello $names
```

## Playground
https://runtime.siwei.dev

## Tutorial
https://siwei.dev/doc/runtime

## Examples
[Game: Snake](https://runtime.siwei.dev/?src=snake)  
[Game: Flappy Bird](https://runtime.siwei.dev/?src=bird)  
[Game: Sliding Puzzle](https://runtime.siwei.dev/?src=puzzle)  
[Game: Sokoban](https://runtime.siwei.dev/?src=sokoban)  
[Game: 2048](https://runtime.siwei.dev/?src=2048)  

[Leetcode 1. Two Sum](https://runtime.siwei.dev/?src=leetcode1)  
[Leetcode 5. Longest Palindromic Substring](https://runtime.siwei.dev/?src=leetcode5)  
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

## Games written in Runtime Script
[倉庫番](https://yjlo123.github.io/sokoban/): A sokoban game  
[2048](https://yjlo123.github.io/2048/): A 2048 game  
[Rundis](https://yjlo123.github.io/rundis/): A mock Redis CLI  
[MoonOS](https://yjlo123.github.io/moon/): A terminal game  
[Wordle](https://yjlo123.github.io/wordle/): A word game

## Editor
[Online Editor](https://runtime.siwei.dev)  
[Visual Studio Code Extension](https://marketplace.visualstudio.com/items?itemName=yjlo123.runtime)  

## Blog
[#runtime_script](https://blog.siwei.dev/tags/runtime-script/)

## Other implementations
[Runtime Go](https://github.com/yjlo123/runtime-go)  

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
