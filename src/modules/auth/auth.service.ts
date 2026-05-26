import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import { signToken } from "../../utils/jwt";
import { ConflictError, UnauthorizedError } from "../../utils/errors";

interface GoogleAuthDTO {
  googleId: string;
  email: string;
  name: string;
}

export async function googleAuth(data: GoogleAuthDTO) {
  let user = await db.query.users.findFirst({
    where: eq(users.googleId, data.googleId),
  });

  if (!user) {
    const byEmail = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (byEmail) {
      [user] = await db
        .update(users)
        .set({ googleId: data.googleId, updatedAt: new Date() })
        .where(eq(users.id, byEmail.id))
        .returning();
    } else {
      [user] = await db
        .insert(users)
        .values({ name: data.name, email: data.email, googleId: data.googleId })
        .returning();
    }
  }

  const token = signToken({ userId: user.id, email: user.email });
  return { user: { id: user.id, name: user.name, email: user.email }, token };
}

interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

export async function register(data: RegisterDTO) {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });

  if (existing) {
    throw new ConflictError("Este e-mail já está em uso");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const [user] = await db
    .insert(users)
    .values({ name: data.name, email: data.email, passwordHash })
    .returning({ id: users.id, name: users.name, email: users.email });

  const token = signToken({ userId: user.id, email: user.email });

  return { user, token };
}

export async function login(data: LoginDTO) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });

  if (!user) {
    throw new UnauthorizedError("E-mail ou senha incorretos");
  }

  if (!user.passwordHash) {
    throw new UnauthorizedError("Esta conta usa login com Google. Acesse pelo botão 'Entrar com Google'.");
  }

  const isValid = await bcrypt.compare(data.password, user.passwordHash);

  if (!isValid) {
    throw new UnauthorizedError("E-mail ou senha incorretos");
  }

  const token = signToken({ userId: user.id, email: user.email });

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
  };
}
