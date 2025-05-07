import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db';
import { ResultSetHeader } from 'mysql2';

interface PaymentInfo {
  id?: string;
  registration_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'bank_transfer';
  receipt_number?: string;
  note?: string;
  received_by: string;
}

class PaymentModel {
  // สร้างการชำระเงินใหม่
  async create(paymentData: PaymentInfo): Promise<string> {
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
      
      // สร้าง ID ใหม่ถ้าไม่มี
      const paymentId = paymentData.id || uuidv4();
      
      const insertPaymentQuery = `
        INSERT INTO payments (
          id, 
          registration_id, 
          amount, 
          payment_date, 
          payment_method, 
          receipt_number,
          note,
          received_by,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const paymentValues = [
        paymentId,
        paymentData.registration_id,
        paymentData.amount,
        paymentData.payment_date,
        paymentData.payment_method,
        paymentData.receipt_number || null,
        paymentData.note || null,
        paymentData.received_by
      ];
      
      await connection.query(insertPaymentQuery, paymentValues);
      
      // อัปเดตสถานะการชำระเงินในตาราง registrations
      const updateRegistrationQuery = `
        UPDATE registrations 
        SET is_paid = 1, updated_at = NOW() 
        WHERE id = ?
      `;
      
      await connection.query(updateRegistrationQuery, [paymentData.registration_id]);
      
      await connection.commit();
      
      return paymentId;
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error creating payment:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
  
  // ดึงข้อมูลการชำระเงินตาม registration_id
  async findByRegistrationId(registrationId: string): Promise<PaymentInfo[]> {
    try {
      const query = `
        SELECT 
          id, 
          registration_id, 
          amount, 
          payment_date, 
          payment_method, 
          receipt_number, 
          note, 
          received_by,
          created_at
        FROM payments
        WHERE registration_id = ?
        ORDER BY payment_date DESC
      `;
      
      const [rows] = await db.query(query, [registrationId]);
      
      return rows as PaymentInfo[];
    } catch (error) {
      console.error('Error finding payment by registration ID:', error);
      throw error;
    }
  }
  
  // ดึงข้อมูลการชำระเงินโดยค้นหาตามคำค้น
  async search(searchTerm: string): Promise<PaymentInfo[]> {
    try {
      const searchPattern = `%${searchTerm}%`;
      
      const query = `
        SELECT 
          p.id, 
          p.registration_id, 
          p.amount, 
          p.payment_date, 
          p.payment_method, 
          p.receipt_number, 
          p.note, 
          p.received_by,
          p.created_at,
          r.student_name,
          r.student_id,
          r.student_phone
        FROM payments p
        JOIN registrations r ON p.registration_id = r.id
        WHERE 
          p.receipt_number LIKE ? OR
          r.student_name LIKE ? OR
          r.student_id LIKE ? OR
          p.registration_id LIKE ?
        ORDER BY p.payment_date DESC
        LIMIT 50
      `;
      
      const [rows] = await db.query(
        query, 
        [searchPattern, searchPattern, searchPattern, searchPattern]
      );
      
      return rows as PaymentInfo[];
    } catch (error) {
      console.error('Error searching payments:', error);
      throw error;
    }
  }
}

export default new PaymentModel(); 