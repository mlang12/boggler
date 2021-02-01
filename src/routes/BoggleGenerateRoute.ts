import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./BaseRoute";
import { BoardType, Boggle } from '../gamelogic/Boggle';

export class boggleGenerateAPI extends BaseRoute {
  public static create(router: Router) {
    router.get("/api/boggle-generate/:boardType", (req: Request, res: Response, next: NextFunction) => {
      console.log(req.params)
      return new boggleGenerateAPI().solve(req, res, next, req.params.boardType);
    });
  }

  constructor() {
    super();
  }

  public solve(req: Request, res: Response, next: NextFunction, boardType?: BoardType) {
    const b = new Boggle();
    const result = b.generate(boardType);
    console.log(`Generated boggle board: ${JSON.stringify(result)}`);
    res.send(result);
  }
}