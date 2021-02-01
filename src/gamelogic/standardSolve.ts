import { getElapsedTime } from '../common/helpers';
import { getBoggleData } from '../server';
import { Boggle } from './boggle';

/**
 * Returns an array (in Map form) of the Scrabble board mapping
 * i.e. what letters are in which 'points' on the board (can be more than 1 spot)
 */
const getBoardMap = (board: string []) => {
  const comboMap: { [index: string]: number[] } = {};
  for (let i = 0; i < board.length; i++) {
    const el = board[i];
    if (!comboMap[el]) {
      comboMap[el] = [i];
    }
    else {
      comboMap[el].push(i);
    }
  }
  return comboMap;
};

/**
 * Returns translated word into points on the boggle board
 */
const getPathsForWord = (word: string, boardMap: { [index: string]: number[] }, hasQ: boolean) => {
  let bases: number[][] = [[]];
  let wordMap: number[][] = [];
  const wordArr = word.split('');

  // When the word has a Q in it, then make sure we ignore the 'u' afterwards
  if (hasQ && wordArr.includes('q')) {
    wordMap = wordArr.map((letter, i) => {
      return (letter === 'u' && i > 0 && wordArr[i - 1] === 'q')
        ? null
        : boardMap[letter]
    });
    wordMap = wordMap.filter(w => w !== null);
  } else {
    wordMap = wordArr.map(letter => boardMap[letter]);
  }

  // Build out the possible paths for each word as there may be more than 1
  for (const arr of wordMap) {
    const newBaseCollection: number[][] = [];
    for (const val of arr) {
      const newBases = bases.map(base => base.concat(val));
      newBaseCollection.push(...newBases);
    }
    bases = newBaseCollection;
  }

  // Remove paths that back-track into a travelled sapce
  const results = [];
  for (const base of bases) {
    if ((new Set(base)).size === base.length) {
      results.push(base);
    } 
  }

  return results;
};

/**
 * Validate that argument path is possible
 */
const checkIsValidPath = (pth: number[], validPaths: Boggle.ValidityMap) => {
  const pathLen = pth.length;
  let validFlow = true;
  
  // If the current position can't come 
  // from the previous position then path invalid
  for (let x = 1; x < pathLen ; x++) {
    if (!validPaths[pth[x] + 1].includes(pth[x - 1] + 1)) {
      validFlow = false;
      break;
    }
  }
  return validFlow;
}

export const solveBoggleStandard = (args: Boggle.SolveArgs): Boggle.SolveResult => {
  const words = getBoggleData();
  const roundStartTime = new Date();
  const { input, pointMap, validityMap} = args;
  const pathTracker: Boggle.PathNode[] = [];
  
  // When we have a Q on the board then we also want to allow
  // words that contain a U, even if the board doesnt have one
  const hasQ: boolean = input.letters.includes('q');

  // Get the possible words that can be made from the letters on the board
  const min = Number(input.wordLengthMin) || 3;
  const filteredWords = words
    .filter((word) => {
      if (word.length < min) {
        return false;
      }
      const wordArr = word.split('');
      if (hasQ && wordArr.includes('q')) {
        for (let x = 0; x < wordArr.length; x++) {
          if (input.letters.includes(wordArr[x])) {
            continue;
          }
          if (wordArr[x] === 'u' && x > 0 && wordArr[x-1] === 'q') {
            continue;
          }
          return false;
        }
        return true;
      }
      return wordArr.every(letter => input.letters.includes(letter)); 
    });

  // See if each word found above can follow a valid 'path' on the scrabble board
  const response: Boggle.WordResult[] = [];
  if (filteredWords.length) {
    const boardMap = getBoardMap(input.letters)
    let wordPaths = [];
    let isValidPath = false;

    for (const word of filteredWords) {
      isValidPath = false;
      wordPaths = getPathsForWord(word, boardMap, hasQ);
      for (const wordPath of wordPaths) {
        let foundWord = false;
        if (checkIsValidPath(wordPath, validityMap)) {
          foundWord = true;
          isValidPath = true;
        }
        pathTracker.push({
          foundWord,
          visited: wordPath.map(i => i+1)
        });
      }
      if (isValidPath) {
        response.push({
          word,
          score: pointMap.get(word.length)
        });
      }
    };
  }

  const totalTime = getElapsedTime(roundStartTime);
  console.log(`Sovled standard: ${totalTime}ms - ${response.length} words - ${input.letters.join('')}`);
  return {
    wordResults: response.sort((a, b) => a.word > b.word ? 1 : -1),
    pathTracker,
    searchTime: totalTime
  };
};