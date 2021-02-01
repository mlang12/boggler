import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./BaseRoute";
import { Boggle, SolveType } from '../gamelogic/Boggle';

export class boggleAPI extends BaseRoute {
  public static create(router: Router) {
    router.get("/api/boggler/:letters/:min/:solveStd/:includePaths", (req: Request, res: Response, next: NextFunction) => {
      console.log(req.params)
      return new boggleAPI().solve(req, res, next, req.params.letters, req.params.min, req.params.solveStd, req.params.includePaths);
    });
  }

  constructor() {
    super();
  }

  public solve(req: Request, res: Response, next: NextFunction, letters: string, wordLengthMin: string, solveStd: string, includePaths: string) {
    const b = new Boggle();
    const result = b.solve({
      letters: letters.split(''),
      wordLengthMin,
      includePaths,
      type: solveStd === 'std' ? SolveType.Standard : SolveType.Trie
    });
    res.send(result);
  }
}