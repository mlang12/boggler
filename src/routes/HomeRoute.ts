import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./BaseRoute";

/**
 * This route serves the boggler template
 */
export class HomeRoute extends BaseRoute {
  public static create(router: Router) {
    router.get("/", (req: Request, res: Response, next: NextFunction) => {
      new HomeRoute().index(req, res, next);
    });
  }

  constructor() {
    super();
  }

  public index(req: Request, res: Response, next: NextFunction) {
    //set custom title
    this.title = "Boggler";

    //set options
    let options: Object = {
      "message": "Boggle solver"
    };

    //render template
    this.render(req, res, "index", options);
  }
}