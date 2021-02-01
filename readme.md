# Welcome to the Boggler App
Generate and solve Boggle boards. 

Don't know what Boggle is? [Check this out first](https://en.wikipedia.org/wiki/Boggle).

_The purpose of this application is to demonstrate the difference between two algorithmic methods of solving a Boggle board._

## Get started
Clone the repo and run the app locally or go to [boggler.mindbrier.com](https://boggler.mindbrier.com/).

To run locally, clone the repo to your local device then inside the directory
```
npm install
npm run compile
npm start
```
Then open you favorite browser and then goto [http://localhost:3000/](http://localhost:3000/) to use the GUI.

## Use the Boggle solver GUI

### Generate a board
- Click the `"Generate"` button to populate the 16 spaces of the Boggle board, or enter your own.
- By default, new-style Boggle dice combinations are used to generate the board letters. However, there is an option to use old style dice.

### Solve a board
- Click on either `"Solve-Trie"` or `"Solve-Standard"` and scroll down to see the solution to the board.
- Check the "Show solve pattern" box, then click either "`Solve`" button to see a slowed-down animation that reflects the pathing taken by the specific algorithm used to solve the board. When the board spots light up green, that reflects having "found" a word.

## Use the Boggle solver API

### To solve
The GET endpoint is as such:
`http://localhost:3000/api/boggler/{BOARD_LETTERS}/{MIN_VAL}/{SOLVE_TYPE}/{INCLUDE_PATHS}`

- `BOARD_LETTER`: 16 lower-case alpha characters
- `MIN_VAL`: The minimum word length (3 is minimum)
- `SOLVE_TYPE`: "std" or "trie"
- `INCLUDE_PATHS`: true or false (1 or 0) on whether to also return all routes travelled for the solution. I suggest "0" initially.

Examples:
```
curl http://localhost:3000/api/boggler/gndosodooruefesa/3/trie/1
curl http://localhost:3000/api/boggler/kywrohthemrtdres/4/std/0
```

### To generate
The API shape is as such:
`http://localhost:3000/api/boggle-generate/{BOARD_TYPE}`

- `BOARD_TYPE`: "OLD" or "NEW"

Examples:
```
curl http://localhost:3000/api/boggle-generate/OLD
curl http://localhost:3000/api/boggle-generate/NEW
```

## How to solve a Boggle board
In both solutions described below, the word dictionary was "pre-processed" and stored in RAM at the time the server was created. So performance times were not impacted by creation of the data structures utilized in each solution. The application uses the [YAWL list of words](https://github.com/elasticdog/yawl) as the dictionary. I did not edit the content of the word list.

_Note: If the letter `"Q"` appears in a square, it is assumed to be a `"Qu"`. Therefore, the letters `"Qeen"` qualify as the word `"Queen"` and count as a 5-letter word._

When I first approached this problem I considered several solutions. The first way which was most apparent, as with many programming problems, was to apply brute force. Just throw careless amounts of compute at the problem and see how fast the computer can do the task that would take me a lifetime to complete if I did it by hand. This method was unlikely the best to solve the problem, and it was mostly out of curiosity that I ventured down the path.

## Brute force (`Solve-Standard`)
 You can see the code for the brute force solution [here](https://bitbucket.org/mindbrier/bogglesolver/src/master/src/gamelogic/standardSolve.ts). 

In the case of "brute force" Boggle board solutions one method is to get every valid "route" and check if any of those routes also happen to be a word in the dictionary. Seems reasonable, but every "solve" of the board would have to calculate all the routes (or cache them), and then check each of those routes against the dictionary containing over a quarter-million words. Nope.

The better approach was to go from the dictionary-side first map the words onto the board, and see if the word landed on a valid path. This was far fewer calculations, but still inefficient. A little optimization was done to the word dictionary by dropping words shorter than 3 characters and longer than 16 - not a lot of words, but it took out some iterations. Then came the key actions - for each word in the dictionary I had to evaluate:

1. Do all the letters in the word fit on the board
2. If so, do the letters fall in a valid "path" or "route" on the board

 A solution generated with this pattern took around 200 - 400ms. If you `"Generate"` a board above, then click on `"Solve-Standard"` you will see the time it takes to solve that particular board. Repeatedly generating and solving boards gives a fairly accurate albeit unscientific idea of the average time to solve using the algorithm.
 
 Now, 200-400ms was not actually terrible considering that it was unlikely we would have a use-case where we need to solve many Boggle boards in quick succession. Selecting the `"Show solve pattern"` option before `"Solve-Standard"`, visually illustrates how inefficient the algorithm actually is. The algorithm throws words onto the board and hopes something sticks. 

## Trie data structure (`Solve-Trie`)
You can find the Trie implementation [here](https://bitbucket.org/mindbrier/bogglesolver/src/master/src/data/dictionaryTrie.ts) and the board navigation [here](https://bitbucket.org/mindbrier/bogglesolver/src/master/src/gamelogic/trieSolve.ts).

The better solution was to fist implement [a Trie](https://en.wikipedia.org/wiki/Trie) data structure. Then recursively navigate the Trie and the Boggle board at the same time. As each route on a board was travelled, it would check:

1. Are the letters travelled so far a word
2. Can I travel legally to another spot
3. Are there "children" to the prefix I have so-far travelled

As long as conditions 2 and 3 were true, we kept traveling down the next route. Once there were no children or valid routes the remainder of the path was discarded. 

Solutions with this method run on average, below 10ms which is orders of magnitude faster than the brute force method. If you click the `"Show solve pattern"` before clicking `"Solve-Trie"` you will see a visual representation of the search pattern taken by the algorithm. Methodically and efficiently traveling each path until either condition 2 or 3 above are not true.

_"Boggle" is a registered trademark of Hasbro, with whom I am in no way affiliated._