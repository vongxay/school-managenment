import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../utils/db';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// กำหนดชนิดข้อมูลสำหรับผู้ใช้
export interface User extends RowDataPacket {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'teacher' | 'staff';
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

// กำหนดชนิดข้อมูลสำหรับสร้างผู้ใช้ใหม่
export interface CreateUserDTO {
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'teacher' | 'staff';
  active?: boolean;
}

// กำหนดชนิดข้อมูลสำหรับอัปเดตผู้ใช้
export interface UpdateUserDTO {
  username?: string;
  password?: string;
  name?: string;
  role?: 'admin' | 'teacher' | 'staff';
  active?: boolean;
}

class UserModel {
  // ค้นหาผู้ใช้ตาม username
  async findByUsername(username: string): Promise<User | null> {
    try {
      const [rows] = await db.execute<User[]>(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  // ค้นหาผู้ใช้ตาม ID
  async findById(id: string): Promise<User | null> {
    try {
      const [rows] = await db.execute<User[]>(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // รับผู้ใช้ทั้งหมด
  async findAll(): Promise<User[]> {
    try {
      const [rows] = await db.query<User[]>(
        'SELECT id, username, name, role, active, created_at, updated_at FROM users'
      );
      return rows;
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  // สร้างผู้ใช้ใหม่
  async create(userData: CreateUserDTO): Promise<string> {
    try {
      // เข้ารหัสรหัสผ่าน
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const id = uuidv4();

      await db.execute(
        'INSERT INTO users (id, username, password, name, role, active) VALUES (?, ?, ?, ?, ?, ?)',
        [
          id,
          userData.username,
          hashedPassword,
          userData.name,
          userData.role,
          userData.active !== undefined ? userData.active : true
        ]
      );

      return id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // อัปเดตผู้ใช้
  async update(id: string, userData: UpdateUserDTO): Promise<boolean> {
    try {
      let query = 'UPDATE users SET ';
      const values: any[] = [];
      const updateFields: string[] = [];

      if (userData.username) {
        updateFields.push('username = ?');
        values.push(userData.username);
      }

      if (userData.password) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        updateFields.push('password = ?');
        values.push(hashedPassword);
      }

      if (userData.name) {
        updateFields.push('name = ?');
        values.push(userData.name);
      }

      if (userData.role) {
        updateFields.push('role = ?');
        values.push(userData.role);
      }

      if (userData.active !== undefined) {
        updateFields.push('active = ?');
        values.push(userData.active);
      }

      if (updateFields.length === 0) {
        return false;
      }

      query += updateFields.join(', ') + ' WHERE id = ?';
      values.push(id);

      const [result] = await db.execute<ResultSetHeader>(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // ลบผู้ใช้
  async delete(id: string): Promise<boolean> {
    try {
      const [result] = await db.execute<ResultSetHeader>(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // ตรวจสอบรหัสผ่าน
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

export default new UserModel(); 