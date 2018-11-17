import { Request, Response, Router } from "express";
import { redis } from "../utils/bootstrapConnections";
import { User } from "../entity/User";

const router: Router = Router();

router.get("/confirm/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = await redis.get(id);
  if (userId) {
    await setEmailConfirmed(id, userId);
    res.json({
      msg: "ok"
    });
  } else {
    res.status(403).json({
      msg: "invalid"
    });
  }
});

const setEmailConfirmed = async (id: string, userId: string) => {
  const updateUser = User.update({ id: userId }, { emailConfirmed: true });
  const updateRedis = redis.del(id);
  await Promise.all([updateUser, updateRedis]);
};
export default router;
