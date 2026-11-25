// Video timestamps written as m:ss or mm:ss, like "3:49".
const TIMESTAMP = /^\d{1,2}:\d{2}$/;

export function isTimestamp(at) {
  return typeof at === 'string' && TIMESTAMP.test(at) && Number(at.split(':')[1]) < 60;
}

// "3:49" -> 229. Throws on anything that isn't m:ss, so a bad row fails the build.
export function toSeconds(at) {
  if (!isTimestamp(at)) {
    throw new Error(`Timestamp "${at}" must look like m:ss, for example 3:49`);
  }
  const [minutes, seconds] = at.split(':').map(Number);
  return minutes * 60 + seconds;
}
