import { Request, Response, Router } from "express";
import { redis } from "./bootstrapConnections";
import { User } from "../entity/User";

const router: Router = Router();

router.get("/confirm/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = await redis.get(id);
  if (userId) {
    await User.update({ id: userId }, { emailConfirmed: true });
    res.json({
      msg: "ok"
    });
  } else {
    res.status(403).json({
      msg: "invalid"
    });
  }
});

export default router;
