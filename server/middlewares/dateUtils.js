// 獲取 UTC+8 時區的今日日期範圍
export const getTodayRange = () => {
  // Constants
  const HOURS_OFFSET = 8; // UTC+8
  const MS_PER_HOUR = 60 * 60 * 1000;

  // Get current time in UTC+8
  const nowUTC = new Date();
  const nowUTC8 = new Date(nowUTC.getTime() + HOURS_OFFSET * MS_PER_HOUR);

  // Extract date components from UTC+8 time
  const year8 = nowUTC8.getUTCFullYear();
  const month8 = nowUTC8.getUTCMonth();
  const day8 = nowUTC8.getUTCDate();

  // Create the start time (00:00:00 UTC+8, expressed in UTC)
  const startUTC = new Date(Date.UTC(year8, month8, day8, 0, 0, 0, 0));
  startUTC.setUTCHours(startUTC.getUTCHours() - HOURS_OFFSET);

  // Create the end time (00:00:00 next day UTC+8, expressed in UTC)
  const endUTC = new Date(startUTC.getTime() + 24 * MS_PER_HOUR);

  return { startUTC, endUTC };
};