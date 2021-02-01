import { isValidString } from '../common/helpers';
import * as messages from '../data/messages';
import { solveBoggleTrie } from './trieSolve';
import { solveBoggleStandard } from './standardSolve';

export enum BoardType {
  New = 'NEW',
  Old = 'OLD'
}

export enum SolveType {
  Trie = 'Trie',
  Standard = 'Standard'
}

export namespace Boggle {
  export interface Input {
    letters: string[],
    wordLengthMin?: string,
    type: SolveType,
    includePaths: string; // 1 or 0
  }
  export interface SolveArgs {
    input: Input;
    validityMap: Boggle.ValidityMap;
    pointMap: Map<number, number>;
  }
  export interface SolveResult {
    wordResults: WordResult[];
    pathTracker: PathNode[];
    searchTime: number;
  }
  export interface WordResult {
    word: string;
    score: number;
  }
  export interface PathNode {
    visited: number[];
    foundWord: boolean;
  }
  export interface Response {
    solved?: {
      input: Boggle.Input;
      words?: WordResult[];
      solveTime: number; // ms
      board?: {
        letters: string[];
        pathTracker: PathNode[];
        totalBoardScore: number;
      }
    }
    error?: string;
  }
  export interface ValidityMap {
   [index: number] : number[]
  }
}

export class Boggle {

  protected title: string;

  constructor() {
    this.title = messages.default.BOGGLE.TITLE;
  }

  /**
   * Returns the valid paths around any point on the 4x4 boggle board
   *  [01][02][03][04]
   *  [05][06][07][08]
   *  [09][10][11][12]
   *  [13][14][15][16]
   */
  getValidityMap = (): Boggle.ValidityMap => {
    return {
      1: [2, 5, 6],
      2: [1, 3, 5, 6, 7],
      3: [2, 4, 6, 7, 8],
      4: [3, 7, 8],
      5: [1, 2, 6, 9, 10],
      6: [5, 7, 1, 2, 3, 9, 10, 11],
      7: [6, 8, 2, 3, 4, 10, 11, 12],
      8: [7, 3, 4, 11, 12],
      9: [5, 6, 10, 13, 14],
      10: [5, 6, 7, 9, 11, 13, 14, 15],
      11: [6, 7, 8, 10, 12, 14, 15, 16],
      12: [7, 8, 11, 15, 16],
      13: [9, 10, 14],
      14: [13, 9, 10, 11, 15],
      15: [14, 10, 11, 12, 16],
      16: [15, 11, 12]
    }
  }

  getBoggleDice = (type: BoardType): string[] => {
    return type === BoardType.Old
      ? ['AACIOT',	
        'ABILTY',	
        'ABJMOQu',	
        'ACDEMP',	
        'ACELRS',	
        'ADENVZ',	
        'AHMORS',	
        'BIFORX',	
        'DENOSW',	
        'DKNOTU',	
        'EEFHIY',	
        'EGKLUY',	
        'EGINTV',	
        'EHINPS',	
        'ELPSTU',
        'GILRUW']
      : ['AAEEGN',
    'ABBJOO',
    'ACHOPS',
    'AFFKPS',
    'AOOTTW',
    'CIMOTU',
    'DEILRX',
    'DELRVY',
    'DISTTY',
    'EEGHNW',
    'EEINSU',
    'EHRTVW',
    'EIOSST',
    'ELRTTY',
    'HIMNUQ',
    'HLNNRZ']
  }
  
  /**
   * Returns a Map of word length to point relationship
   */
  getPointMap = (): Map<number, number> => {
    return new Map([
      [3,1],
      [4,1],
      [5,2],
      [6, 3],
      [7, 5],
      [8, 11],
      [9, 11],
      [10, 11],
      [11, 11],
      [12, 11],
      [13, 11],
      [14, 11],
      [15, 11],
      [16, 11],
    ]);
  }

  /**
   * Randomly orders an array of strings
   * @param dice
   */
  randomizeDice = (dice: string[]) => {
    let current = dice.length
    let temp = undefined;
    let randVal = undefined;

    while (0 !== current) {
      randVal = Math.floor(Math.random() * current);
      current -= 1;
      temp = dice[current];
      dice[current] = dice[randVal];
      dice[randVal] = temp;
    }

    return dice;
  }

  /**
   * Will attempt to unscramble the letters into matching words
   * @param letters the letters to seek matching words
   */
  solve(input: Boggle.Input) {
    const { letters } = input;
    const { ERRORS } = messages.default.BOGGLE;
    const boggleResponse: Boggle.Response = {};
    if (letters.length === 16 && isValidString(letters.join(''))) {
      const args: Boggle.SolveArgs = {
        input,
        validityMap: this.getValidityMap(),
        pointMap: this.getPointMap()
      }
      const result = input.type === SolveType.Standard
        ? solveBoggleStandard(args)
        : solveBoggleTrie(args);
      if (result.wordResults.length === 0) {
        boggleResponse.error = ERRORS.NO_WORDS_FOUND;
      } else {
        boggleResponse.solved = {
          input,
          words: result.wordResults,
          solveTime: result.searchTime,
          board: {
            letters,
            totalBoardScore: result.wordResults.map(w => w.score).reduce((a, b) => a + b),
            pathTracker: input.includePaths === '1' ? result.pathTracker : []
          }
        }
      }
    } else if (letters.length === 16) {
      boggleResponse.error = ERRORS.INVALID_CHARACTERS;
    } else {
      boggleResponse.error = `${ERRORS.INCOMPLETE_BOARD}: ${letters.join()}`;
    }
    return boggleResponse;
  }

  /**
   * Returns a new boggle board using either the new or old dice format.
   * @default New-style dice board
   */
  generate(boardType: BoardType = BoardType.New) {
    const letters: string[] = [];
    
    // Get the dice in the style requested, then shuffle the dice.
    const dice = this.randomizeDice(this.getBoggleDice(boardType));
    for (const die of dice) {
      const side = Math.floor(Math.random() * 6);
      letters.push(die[side]);
    }
    
    console.log(`\n\nGot dice in ${boardType} style. Letters:: ${letters.join(',')}`)
    return { letters };
  }
}