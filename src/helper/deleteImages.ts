import fs from "fs/promises";

export const deleteImageHelper = async (imagePath: string) => {
  try {
    await fs.unlink(imagePath);
  } catch (error) {
    throw error;
  }
};
