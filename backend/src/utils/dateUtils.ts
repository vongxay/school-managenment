import { format, parseISO } from 'date-fns';

/**
 * ฟังก์ชันสำหรับจัดรูปแบบวันที่ให้เป็น yyyy/MM/dd
 * @param date วันที่ที่ต้องการจัดรูปแบบ
 * @returns วันที่ในรูปแบบ yyyy/MM/dd
 */
export const formatDateToYMD = (date: Date | string | null): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'yyyy/MM/dd');
  } catch (error) {
    console.error('ไม่สามารถจัดรูปแบบวันที่ได้:', error);
    return '';
  }
};

/**
 * ฟังก์ชันสำหรับแปลงวันที่จาก string ให้เป็น Date object
 * @param dateString วันที่ในรูปแบบ string
 * @returns Date object
 */
export const parseDate = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  
  try {
    return parseISO(dateString);
  } catch (error) {
    console.error('ไม่สามารถแปลงวันที่ได้:', error);
    return null;
  }
}; 