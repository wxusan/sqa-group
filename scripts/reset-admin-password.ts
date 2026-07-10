import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before resetting an administrator password.");
  }
  if (password.length < 14) {
    throw new Error("ADMIN_PASSWORD must be at least 14 characters long.");
  }

  const user = await prisma.adminUser.update({
    where: { email },
    data: { passwordHash: await hash(password, 12) },
    select: { email: true },
  });
  console.info(`Password reset for ${user.email}.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
