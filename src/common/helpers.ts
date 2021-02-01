/**
 * Will check that a string is only alpha characters and return true or false
 * @param str string to validate
 */
export const isValidString = (str: string): boolean => {
  return !!(str && str.replace(/[a-zA-Z]+/g, '').length === 0)
};


/**
 * Sorts the letters of a string by alpha - a to z.
 * Converts all upper-case characters to lowercase before sorting
 * @param str 
 */
export const sortString = (str: string = ''): string => {
  if (!isValidString(str)) {
    return str;
  }
  return str
    .toLocaleLowerCase()
    .split('')
    .sort()
    .join('');
};

/**
 * Returns ms passed from startTime to endTime
 * @param startTime 
 * @param endTime optional - uses current time when not provided
 */
export const getElapsedTime = (startTime: Date, endTime?: Date) => {
  return ((endTime || new Date()).valueOf() - startTime.valueOf());
};