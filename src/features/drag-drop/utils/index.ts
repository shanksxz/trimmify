export { formatFileSize } from "@/utils/formatters";

export const validateFileType = (
	file: File,
	allowedTypes: readonly string[],
): boolean => {
	return allowedTypes.includes(file.type);
};

export const validateFileSize = (file: File, maxSize: number): boolean => {
	return file.size <= maxSize;
};

export const createFileUrl = (file: File): string => {
	return URL.createObjectURL(file);
};

export const revokeFileUrl = (url: string): void => {
	URL.revokeObjectURL(url);
};
