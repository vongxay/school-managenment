# School Management System API

ລະບົບ Backend API ສຳລັບໂຄງການບໍລິຫານຈັດການໂຮງຮຽນ

## ຂໍ້ກຳນົດເບື້ອງຕົ້ນ

- Node.js (v14 ຫຼື ສູງກວ່າ)
- MySQL (ຜ່ານ XAMPP)
- npm ຫຼື yarn

## ການຕິດຕັ້ງ

1. ຕິດຕັ້ງ XAMPP ແລະ ເປີດໃຊ້ງານ Apache ແລະ MySQL

2. ສ້າງຖານຂໍ້ມູນ
   - ເປີດ phpMyAdmin ຢູ່ທີ່ http://localhost/phpmyadmin
   - ນຳເຂົ້າໄຟລ໌ SQL ຈາກ `src/utils/database.sql`

3. ຕິດຕັ້ງແພັກເກດທີ່ຈຳເປັນ
   ```
   npm install
   ```

4. ສ້າງໄຟລ໌ .env ຢູ່ໃນໂຟລເດີຫຼັກຂອງໂຄງການ ແລະ ຕັ້ງຄ່າດັ່ງນີ້:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=school_management
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=1d
   ```

5. ຫາກຕ້ອງການແກ້ໄຂຄ່າເລີ່ມຕົ້ນໃນຂັ້ນຕອນສ້າງ:
   ```
   npm run build
   ```

## ການໃຊ້ງານ

1. ໃນການພັດທະນາ (development):
   ```
   npm run dev
   ```

2. ໃນການໃຊ້ງານຈິງ (production):
   ```
   npm start
   ```

## API ທີ່ມີໃຫ້ໃຊ້ງານ

### ການພິສູດຕົວຕົນ
- `POST /api/auth/login` - ເຂົ້າສູ່ລະບົບ
- `GET /api/auth/check` - ກວດສອບການພິສູດຕົວຕົນ

### ຜູ້ໃຊ້ (ຕ້ອງມີສິດ admin)
- `GET /api/users` - ດຶງຂໍ້ມູນຜູ້ໃຊ້ທັງໝົດ
- `GET /api/users/:id` - ດຶງຂໍ້ມູນຜູ້ໃຊ້ຕາມ ID
- `POST /api/users` - ສ້າງຜູ້ໃຊ້ໃໝ່
- `PUT /api/users/:id` - ອັບເດດຂໍ້ມູນຜູ້ໃຊ້
- `DELETE /api/users/:id` - ລຶບຜູ້ໃຊ້

### ນັກຮຽນ
- `GET /api/students` - ດຶງຂໍ້ມູນນັກຮຽນທັງໝົດ
- `GET /api/students/:id` - ດຶງຂໍ້ມູນນັກຮຽນຕາມ ID
- `GET /api/students/student-id/:studentId` - ດຶງຂໍ້ມູນນັກຮຽນຕາມລະຫັດນັກຮຽນ
- `POST /api/students` - ສ້າງນັກຮຽນໃໝ່ (ຕ້ອງມີສິດ admin/staff)
- `PUT /api/students/:id` - ອັບເດດຂໍ້ມູນນັກຮຽນ (ຕ້ອງມີສິດ admin/staff)
- `DELETE /api/students/:id` - ລຶບນັກຮຽນ (ຕ້ອງມີສິດ admin) 