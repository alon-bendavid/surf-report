import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import User, { LoginInput, NewUserInput, UserRole } from "../entities/User";
import { GraphQLError } from "graphql";
import { verify } from "argon2";
import jwt from "jsonwebtoken";
import env from "../env";
import { Context } from "../types";

@Resolver()
class UserResolver {
  @Mutation(() => User)
  async createUser(@Arg("data", { validate: true }) data: NewUserInput) {
    const existingUser = await User.findOneBy({ email: data.email });
    if (existingUser !== null) throw new GraphQLError("EMAIL_ALREADY_TAKEN");

    const newUser = new User();
    Object.assign(newUser, data);
    const newUserWithId = await newUser.save();
    return newUserWithId;
  }

  @Mutation(() => String)
  async login(@Arg("data") data: LoginInput, @Ctx() ctx: Context) {
    const existingUser = await User.findOneBy({ email: data.email });
    if (existingUser === null) throw new GraphQLError("Invalid Credentials");
    const passwordVerified = await verify(
      existingUser.hashedPassword,
      data.password
    );
    if (!passwordVerified) throw new GraphQLError("Invalid Credentials");

    const token = jwt.sign(
      {
        userId: existingUser.id,
      },
      env.JWT_PRIVATE_KEY,
      { expiresIn: "30d" }
    );

    ctx.res.cookie("token", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: env.NODE_ENV === "production",
    });
    // return token;
    return token;
  }

  // @Authorized()
  // @Query(() => User)
  // async profile(@Ctx() ctx: Context) {
  //   return ctx.currentUser;
  // }
  @Authorized([UserRole.Admin])
  @Query(() => [User])
  async users(): Promise<User[]> {
    return User.find();
  }
  // @Authorized()
  // @Query(()=>[User])
  // async users():Promise<User[]>{
  //   return User.find();
  // }

  @Authorized()
  @Query(() => User)
  async profile(@Ctx() ctx: Context) {
    if (!ctx.currentUser) throw new GraphQLError("you need to be logged in!");
    return User.findOneOrFail({
      where: { id: ctx.currentUser.id },
    });
  }
  // @Mutation(() => String)
  // async logout(@Ctx() ctx: Context) {
  //   ctx.res.clearCookie("token");
  //   return "ok";
  // }

  @Mutation(() => String)
  async logout(@Ctx() ctx: Context) {
    ctx.res.clearCookie("token");
    return "ok";
  }
}

export default UserResolver;
