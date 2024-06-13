export const formatTimeCounterInMinute = (seconds: number) => {
  if (!seconds || seconds < 0) {
    return "00:00";
  }

  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = seconds % 60;

  // Add leading zero if necessary
  var formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  var formattedSeconds = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  return formattedMinutes + ":" + formattedSeconds;
};
