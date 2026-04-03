// User input (Local time)
//         ↓
// Convert to UTC
//         ↓
// Save to DB
//         ↓
// Fetch from DB (UTC)
//         ↓
// Convert to Local
//         ↓
// Show to user

export const convertDateTime = async (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + offset);
};