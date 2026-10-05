import * as z from "zod";

const normalizeTime = (value: string) => {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}:\d{2})/);
  return match ? match[1] : trimmed;
};

const timeStringSchema = z
  .string()
  .min(1, "Time is required")
  .transform(normalizeTime)
  .refine((time) => /^([0-1]?\d|2[0-3]):[0-5]\d$/.test(time), {
    message: "Invalid time format",
  });

const dateStringSchema = z
  .string()
  .min(1, "Date is required")
  .refine((date) => !Number.isNaN(Date.parse(date)), {
    message: "Invalid date format",
  });

const compareDateTime = (
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string,
) => {
  const start = Date.parse(`${startDate}T${startTime}`);
  const end = Date.parse(`${endDate}T${endTime}`);
  return !Number.isNaN(start) && !Number.isNaN(end) && end > start;
};

export const scheduleFieldsZodSchema = z.object({
  startDate: dateStringSchema,
  endDate: dateStringSchema,
  startTime: timeStringSchema,
  endTime: timeStringSchema,
});

export const createScheduleZodSchema = scheduleFieldsZodSchema.refine(
  (data) =>
    compareDateTime(data.startDate, data.endDate, data.startTime, data.endTime),
  {
    message: "End date and time must be after start date and time",
    path: ["endTime"],
  },
);

export const updateScheduleZodSchema = createScheduleZodSchema;

export type TCreateScheduleInput = z.input<typeof createScheduleZodSchema>;
export type TCreateSchedule = z.output<typeof createScheduleZodSchema>;
export type TUpdateScheduleInput = z.input<typeof updateScheduleZodSchema>;
export type TUpdateSchedule = z.output<typeof updateScheduleZodSchema>;
