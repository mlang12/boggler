import { getElapsedTime } from '../common/helpers';
import { TrieNode } from '../data/dictionaryTrie';
import { getTrie } from '../server';
import { Boggle } from './boggle';

export const solveBoggleTrie = (args: Boggle.SolveArgs): Boggle.SolveResult => {
  const roundStartTime = new Date();
  const wordTrie = getTrie();
  const { input, validityMap, pointMap } = args;
  const min = Number(input.wordLengthMin) || 3;
  const foundWords: {[index: string]: number } = {};
  const pathTracker: Boggle.PathNode[] = [];
  
  // Recurse through the boggle board checking each node of the Trie
  // along the way. If we find words, add them to the hash. If there are
  // legal points on the board, try to travel to those those spots.
  // When we reach a point without children, we stop travelling that route.
  const recurse = (point: number, fromPath: number[], n?: TrieNode): Boggle.PathNode => {
    const letter = input.letters[point -1];
    let nextNode = wordTrie.next(letter, n);
    const pathNode: Boggle.PathNode = {
      visited: fromPath.concat([point]),
      foundWord: false
    }
  
    // When letter is `Q`, grant a `U` for the following letter
    if (nextNode !== undefined && letter === 'q') {
      nextNode = wordTrie.next('u', nextNode);
    }

    if (nextNode === undefined) {
      pathTracker.push(pathNode);
      return;
    }

    if (nextNode.word != null && nextNode.word.length >= min) {
      pathNode.foundWord = true;
      foundWords[nextNode.word] = pointMap.get(nextNode.word.length);
    }

    const newFromPath = [...fromPath];
    newFromPath.push(point);

    // Get legal routes not travelled. Spawn a recursion from the next valid
    // and untravelled board locations.
    for (const nextPoint of validityMap[point]) {
      if (!newFromPath.includes(nextPoint)) {
        recurse(nextPoint, newFromPath, nextNode);
      }
    }
    pathTracker.push(pathNode);
  };

  // Initiate recursive search of the board for each of the 
  // 16 spots on the Boggle board.
  for (let spot = 1; spot < 17; spot++) {
    recurse(spot, []);
  }
  
  // Format the response as expected.
  const response: Boggle.WordResult[] = [];
  for (const word of Object.keys(foundWords)) {
    response.push({
      word,
      score: foundWords[word]
    });
  }

  const totalTime = getElapsedTime(roundStartTime);
  console.log(`Sovled With Trie: ${totalTime}ms - ${response.length} words - ${input.letters.join('')}`);
  return {
    wordResults: response.sort((a, b) => a.word > b.word ? 1 : -1),
    pathTracker,
    searchTime: totalTime
  };
};