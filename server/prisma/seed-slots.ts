import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

// Tunables: how much demo availability each doctor gets.
const MONTHS_AHEAD = 6;
const SLOTS_PER_MONTH = 3;
// 30-min slot starts, expressed in BST (UTC+6, no DST).
const SLOT_START_MINUTES = [540, 600, 660, 780, 840, 960, 1020, 1080];
const BST_OFFSET_MINUTES = 6 * 60;

const pick = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const randomDay = (year: number, month: number, minDay: number): number => {
  const maxDay = 28;
  return minDay + Math.floor(Math.random() * (maxDay - minDay + 1));
};

const toUtc = (year: number, month: number, day: number, bstMinutes: number): Date => {
  return new Date(
    Date.UTC(year, month, day, 0, bstMinutes - BST_OFFSET_MINUTES, 0, 0),
  );
};

const isFridayInBst = (utcDate: Date): boolean => {
  return new Date(utcDate.getTime() + BST_OFFSET_MINUTES * 60 * 1000).getUTCDay() === 5;
};

const seedSlots = async () => {
  const now = new Date();
  const doctors = await prisma.doctor.findMany({
    where: { isDeleted: false },
    select: { id: true, name: true },
  });

  if (doctors.length === 0) {
    throw new Error(
      "Seed needs at least one doctor. Register a doctor first, then run pnpm seed:slots.",
    );
  }

  let createdSchedules = 0;
  let createdClaims = 0;
  let skippedMonths = 0;

  for (const doctor of doctors) {
    for (let offset = 0; offset < MONTHS_AHEAD; offset += 1) {
      const monthDate = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1),
      );
      const year = monthDate.getUTCFullYear();
      const month = monthDate.getUTCMonth();
      const monthStart = new Date(Date.UTC(year, month, 1));
      const monthEnd = new Date(Date.UTC(year, month + 1, 1));

      const existingOpen = await prisma.doctorSchedules.count({
        where: {
          doctorId: doctor.id,
          isBooked: false,
          schedule: { startDateTime: { gte: monthStart, lt: monthEnd } },
        },
      });
      if (existingOpen >= SLOTS_PER_MONTH) {
        skippedMonths += 1;
        continue;
      }

      const needed = SLOTS_PER_MONTH - existingOpen;
      const takenInRun = new Set<string>();

      for (let i = 0; i < needed; i += 1) {
        const minDay = offset === 0 ? now.getUTCDate() + 1 : 1;
        let start: Date | null = null;

        for (let attempt = 0; attempt < 20 && !start; attempt += 1) {
          const candidate = toUtc(
            year,
            month,
            randomDay(year, month, Math.min(minDay, 28)),
            pick(SLOT_START_MINUTES),
          );
          if (candidate <= now || isFridayInBst(candidate)) {
            continue;
          }
          if (takenInRun.has(candidate.toISOString())) {
            continue;
          }
          start = candidate;
        }

        if (!start) {
          continue;
        }
        const end = new Date(start.getTime() + 30 * 60 * 1000);
        takenInRun.add(start.toISOString());

        let schedule = await prisma.schedule.findFirst({
          where: { startDateTime: start, endDateTime: end },
          select: { id: true },
        });
        if (!schedule) {
          schedule = await prisma.schedule.create({
            data: { startDateTime: start, endDateTime: end },
            select: { id: true },
          });
          createdSchedules += 1;
        }

        const alreadyClaimed = await prisma.doctorSchedules.findUnique({
          where: {
            doctorId_scheduleId: {
              doctorId: doctor.id,
              scheduleId: schedule.id,
            },
          },
          select: { doctorId: true },
        });
        if (!alreadyClaimed) {
          await prisma.doctorSchedules.create({
            data: { doctorId: doctor.id, scheduleId: schedule.id },
          });
          createdClaims += 1;
        }
      }
    }
  }

  console.log(
    `seed:slots done — ${createdSchedules} new timetables, ` +
      `${createdClaims} new open slots across ${doctors.length} doctor(s), ` +
      `${skippedMonths} doctor-month(s) already had enough. Rerun anytime; it only tops up.`,
  );
};

seedSlots()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
