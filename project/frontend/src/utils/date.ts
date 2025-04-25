export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);

  const day = date.getDate().toString().padStart(2, "0"); // Use local date instead of UTC
  const month = date.toLocaleString("en-US", {
    month: "short",
  }); // Use local month without forcing UTC

  // Format the date as "DD MMM"
  const formattedDate = `${day} ${month}`;

  return formattedDate;
};

export const isLessThan24Hours = (isoDate: string): boolean => {
  const date = new Date(isoDate); // Convert ISO string to Date object
  const now = new Date();
  const timeDifference = date.getTime() - now.getTime(); // Difference in milliseconds

  const hoursDifference = timeDifference / (1000 * 60 * 60); // Convert milliseconds to hours

  return hoursDifference <= 24 && timeDifference > 0; // Ensure it's in the future and less than 24 hours
};

export const isToday = (isoDate: string): boolean => {
  const date = new Date(isoDate); // Convert ISO string to Date object
  const today = new Date();

  // Remove the time part of both dates for accurate date comparison
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return today.getTime() === date.getTime();
};

export const isDateInPast = (isoDate: string): boolean => {
  const date = new Date(isoDate);
  const now = new Date();

  // Set both dates to start of day for comparison
  date.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  return date < now; // Returns true if the given date is before today
};
