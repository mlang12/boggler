import * as bodyParser from "body-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import { TrieDictionary } from './data/dictionaryTrie';
import { WORD_STRING } from './data/words';
import { boggleAPI, boggleGenerateAPI, HomeRoute } from "./routes/index";
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");

export type DataDictionary = {
  [index: string]: string
}

/**
 * We store the data in RAM for fast responses.
 */
const PREPARED_BOGGLE_DATA: string[] = [];
const PREPARED_TRIE = new TrieDictionary();

const prepareDataDictionary = (words: string[]): void => {
  const qOnlyWord = [];
  const wrongSize = [];
  for (const word of words) {
    if (word.length < 17 && word.length > 2) {
      // We are going to dump words that contain a "Q"
      // not followed by a "U" because our board will only
      // contain a "Qu" piece, not a "Q" piece.
      let isQOnly = false;
      for (const [i, letter] of word.split('').entries()) {
        if (letter === 'q') {
          if (i === (word.length - 1)) {
            isQOnly = true;
            break;
          } else if (word[i+1] !== 'u') {
            isQOnly = true;
            break;
          }
        }
      }
      if (!isQOnly) {
        PREPARED_BOGGLE_DATA.push(word);
      } else {
        qOnlyWord.push(word);
      }
    } else {
      wrongSize.push(word);
    }
  }
  console.log(`Raw word list: ${words.length} words.`);
  console.log(`Excluded ${wrongSize.length} Words bigger than 16 or smaller than 3 letters.`);
  console.log(`Excluded ${qOnlyWord.length} Q-only words.`);
  console.log(`Total processed dictionary size: ${PREPARED_BOGGLE_DATA.length}`);
};

const prepareTrie = (words: Readonly<string[]>): void => {
  PREPARED_TRIE.populate(words);
}

const prepareData = (): void => {
  const dictionaryWords = WORD_STRING.split('\n');

  console.time('prepareDataDictionary');
  prepareDataDictionary(dictionaryWords);
  console.timeEnd('prepareDataDictionary');

  console.time('prepareDataTrie');
  prepareTrie(getBoggleData());
  console.timeEnd('prepareDataTrie');
}

export const getBoggleData = (): Readonly<string[]> => {
  // Deconstruct here would be super expensive.
  // Would have to do something to protect the data in a case where it really mattered.
  // So we are using `Readonly` and hoping for the best.
  return  PREPARED_BOGGLE_DATA;
};

export const getTrie = (): Readonly<TrieDictionary> => {
  return PREPARED_TRIE;
};

/**
 * The server.
 *
 * @class Server
 */
export class Server {

  public app: express.Application;

  /**
   * Bootstrap the application.
   *
   * @class Server
   * @method bootstrap
   * @static
   * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
   */
  public static bootstrap(): Server {
    return new Server();
  }

  /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
  constructor() {
    //create expressjs application
    this.app = express();

    //configure application
    this.config();

    //add routes
    this.routes();

    //add api
    this.api();

    prepareData();
  }

  /**
   * Create REST API routes
   *
   * @class Server
   * @method api
   */
  public api() {
    let router: express.Router;
    router = express.Router();

    boggleAPI.create(router);
    boggleGenerateAPI.create(router);

    this.app.use(router);
  }

  /**
   * Configure application
   *
   * @class Server
   * @method config
   */
  public config() {
    //add static paths
    this.app.use(express.static(path.join(__dirname, "public")));

    //configure pug
    this.app.set("views", path.join(__dirname, "views"));
    this.app.set("view engine", "pug");

    //use logger middlware
    this.app.use(logger("dev"));

    //use json form parser middlware
    this.app.use(bodyParser.json());

    //use query string parser middlware
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));

    //use override middlware
    this.app.use(methodOverride());

    //catch 404 and forward to error handler
    this.app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
        err.status = 404;
        next(err);
    });

    //error handling
    this.app.use(errorHandler());
  }

  /**
   * Create router
   *
   * @class Server
   * @method api
   */
  public routes() {
    let router: express.Router;
    router = express.Router();
  
    HomeRoute.create(router);
  
    //use router middleware
    this.app.use(router);
  }
}