// src/utils/crypto.js
import CryptoJS from "crypto-js";

// ⚠️ IMPORTANT: Replace this with a strong, permanent secret key. 
// Ideally, this key should not be hardcoded but loaded from a secure environment variable.
const SECRET_KEY = "your_access_secure_key_123456";

/**
 * Encrypts data using AES-256-CBC encryption.
 * @param {string} data - The string data to encrypt (e.g., email or role).
 * @returns {string} The encrypted data string.
 */
export const encryptData = (data) => {
    if (!data) return "";
    try {
        // Encrypt the plain text using the secret key
        const ciphertext = CryptoJS.AES.encrypt(data, SECRET_KEY);
        // Convert the ciphertext object to a string format for storage
        return ciphertext.toString();
    } catch (error) {
        console.error("Encryption failed:", error);
        return "";
    }
};

/**
 * Decrypts data that was encrypted using AES-256-CBC.
 * @param {string} encryptedData - The encrypted string to decrypt.
 * @returns {string} The original, decrypted string.
 */
export const decryptData = (encryptedData) => {
    if (!encryptedData) return "";
    try {
        // Decrypt the ciphertext using the secret key
        const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        // Convert the bytes to a UTF-8 string
        const plaintext = bytes.toString(CryptoJS.enc.Utf8);

        // Return only if decryption was successful and resulted in a non-empty string
        if (plaintext) {
            return plaintext;
        } else {
            // This might happen if the key is wrong or the data is corrupted
            console.error("Decryption resulted in empty/invalid string.");
            return "";
        }
    } catch (error) {
        console.error("Decryption failed (Likely invalid key or data format):", error);
        return "";
    }
};