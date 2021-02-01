export class TrieNode {
  children: { [index: string]: TrieNode }
  word?: string;

  constructor(word?: string) {
    this.children = {};
    this.word = word;
  }
}

export class TrieDictionary {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  private insert(word: string) {
    let node = this.root;
    for (let i = 0; i < word.length; i++) {
      if (node.children[word[i]] === undefined) {
        node.children[word[i]] = new TrieNode();
      } 
      node = node.children[word[i]];
    }
    node.word = word;
  }

  private getNodeAt(str: string) {
    let node = this.root;
    for (let i = 0; i < str.length; i++) {
      const childNode = node.children[str[i]];
      if (childNode === undefined) {
        return undefined;
      }
      node = childNode;
    }
    return node;
  }

  populate(words: string[] | Readonly<string[]>) {
    for (const word of words) {
      this.insert(word);
    }
  }

  hasWord(word: string) {
    const node = this.getNodeAt(word);
    return (node && node.word != null) || false;
  }

  next(char: string, fromNode?: TrieNode): TrieNode | undefined {
    if (char.length !== 1) {
      throw new Error(`Navigate expected a single character, received "${char}"`)
    }
    if (fromNode == null) {
      return this.getNodeAt(char);;
    }
    return fromNode.children[char];
  }
}
