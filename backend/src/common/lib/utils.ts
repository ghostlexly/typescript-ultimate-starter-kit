/**
 * Get a random integer between the min and max values provided
 * @param min
 * @param max
 * @returns
 */
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Clear the input string from any special characters, replace ";" with ","
 * @param input
 * @returns
 */
const clearCsvInput = (input) => {
  if (input && typeof input === "string") {
    input = input.replace(/;/g, ",");
    input = input.replace(/(\r\n|\n|\r)/gm, "");

    return input;
  } else {
    return input;
  }
};

/**
 * Check if the URL (string) provided is valid
 * @param url
 * @returns
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Check if all required fields are provided and not empty in the object provided
 * Useful for checking if all required fields are provided in the csv row, request body etc.
 * @param param0
 * @returns
 */
const isFieldsProvided = ({ requiredFields, object }) => {
  for (const field of requiredFields) {
    const value = object[field];
    if (!value || value.trim() === "") {
      return false; // Invalid if any required field is empty or URL is invalid
    }
  }

  return true; // All required fields are valid
};

/**
 * Sanitize the text by replacing and removing all special characters and numbers.
 * Change accented characters to their normal form. (e.g. é -> e)
 */
const sanitizeText = (text) => {
  // Normaliser le texte pour décomposer les caractères accentués
  let normalizedText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Supprimer les caractères non alphabétiques et les chiffres
  normalizedText = normalizedText.replace(/[^A-Za-z' -]/g, "");

  return normalizedText;
};

export const utils = {
  getRandomInt,
  clearCsvInput,
  isValidUrl,
  isFieldsProvided,
  sanitizeText,
};
