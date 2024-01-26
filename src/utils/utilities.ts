/**
 * This functions checks if two numbers are almost the same so we can decide if we can delete the next image or not
 * @param num1 
 * @param num2 
 * @returns {boolean}
 */
export const areNumbersAlmostSame = (num1: number, num2: number, tolerance: number): boolean => {
    const difference = Math.abs(num1 - num2);

    return difference <= tolerance;
}