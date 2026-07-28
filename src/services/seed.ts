import { db } from './db'

export async function seedData() {
  const count = await db.products.count()
  if (count > 0) return

  const branchId = 1

  const catIds = await db.categories.bulkAdd([
    { name: 'ข้าวสาร', description: 'ข้าวสารทุกประเภท', branchId },
    { name: 'อาหารแห้ง', description: 'บะหมี่กึ่งสำเร็จรูป, ปลากระป๋อง, น้ำปลา', branchId },
    { name: 'เครื่องปรุง', description: 'ซอส, น้ำจิ้ม, เครื่องเทศ', branchId },
    { name: 'ขนมขบเคี้ยว', description: 'ขนมถุง, ของว่าง', branchId },
    { name: 'เครื่องดื่ม', description: 'น้ำอัดลม, น้ำผลไม้, เกลือแร่', branchId },
    { name: 'ของใช้', description: 'ของใช้ประจำวัน', branchId },
  ], { allKeys: true })

  await db.products.bulkAdd([
    { name: 'ข้าวหอมมะลิ 5 กก.', categoryId: catIds[0], unit: 'ถุง', price: 180, cost: 160, stock: 20, barcode: '8850001100012', active: 1, lowStockThreshold: 5, branchId },
    { name: 'ข้าวหอมมะลิ 1 กก.', categoryId: catIds[0], unit: 'ถุง', price: 45, cost: 38, stock: 30, barcode: '8850001100029', active: 1, lowStockThreshold: 10, branchId },
    { name: 'ข้าวเหนียว 1 กก.', categoryId: catIds[0], unit: 'ถุง', price: 40, cost: 34, stock: 15, barcode: '8850001100036', active: 1, lowStockThreshold: 5, branchId },
    { name: 'ข้าวกล้อง 1 กก.', categoryId: catIds[0], unit: 'ถุง', price: 55, cost: 46, stock: 12, barcode: '8850001100043', active: 1, lowStockThreshold: 5, branchId },

    { name: 'มาม่า ต้มยำกุ้ง', categoryId: catIds[1], unit: 'ซอง', price: 6, cost: 5, stock: 100, barcode: '8850257105003', active: 1, lowStockThreshold: 20, branchId },
    { name: 'มาม่า ไก่', categoryId: catIds[1], unit: 'ซอง', price: 6, cost: 5, stock: 100, barcode: '8850257105010', active: 1, lowStockThreshold: 20, branchId },
    { name: 'ปลากระป๋องสามแม่ครัว', categoryId: catIds[1], unit: 'กระป๋อง', price: 18, cost: 15, stock: 48, barcode: '8850888100019', active: 1, lowStockThreshold: 12, branchId },
    { name: 'น้ำปลา ตราเด็กสมบูรณ์ 700ml', categoryId: catIds[1], unit: 'ขวด', price: 35, cost: 29, stock: 24, barcode: '8850135100168', active: 1, lowStockThreshold: 6, branchId },
    { name: 'น้ำมันพืช 1 ลิตร', categoryId: catIds[1], unit: 'ขวด', price: 62, cost: 54, stock: 18, barcode: '8852099100149', active: 1, lowStockThreshold: 6, branchId },
    { name: 'ไข่ไก่ เบอร์ 2 (10 ฟอง)', categoryId: catIds[1], unit: 'แผง', price: 28, cost: 24, stock: 20, barcode: '8854527101005', active: 1, lowStockThreshold: 5, branchId },

    { name: 'ซอสปรุงรสฝาเขียว 300ml', categoryId: catIds[2], unit: 'ขวด', price: 42, cost: 36, stock: 18, barcode: '8850135100281', active: 1, lowStockThreshold: 6, branchId },
    { name: 'ซอสหอยนางรม 300ml', categoryId: catIds[2], unit: 'ขวด', price: 38, cost: 32, stock: 15, barcode: '8850135101213', active: 1, lowStockThreshold: 6, branchId },
    { name: 'น้ำจิ้มไก่ 300ml', categoryId: catIds[2], unit: 'ขวด', price: 32, cost: 27, stock: 14, barcode: '8850135100724', active: 1, lowStockThreshold: 6, branchId },
    { name: 'ผงชูรส ตราปลาหมึก 200g', categoryId: catIds[2], unit: 'ซอง', price: 25, cost: 21, stock: 25, barcode: '8850135250016', active: 1, lowStockThreshold: 10, branchId },

    { name: 'เลย์ รสปรุงรส', categoryId: catIds[3], unit: 'ถุง', price: 20, cost: 17, stock: 40, barcode: '8850347003591', active: 1, lowStockThreshold: 10, branchId },
    { name: 'โดริโต้ รสซุปเปอร์', categoryId: catIds[3], unit: 'ถุง', price: 20, cost: 17, stock: 35, barcode: '8850347004321', active: 1, lowStockThreshold: 10, branchId },
    { name: 'โออิชิ มิราเคิล', categoryId: catIds[3], unit: 'ถุง', price: 15, cost: 12, stock: 45, barcode: '8850347005434', active: 1, lowStockThreshold: 10, branchId },
    { name: 'ขนมปังปอนด์', categoryId: catIds[3], unit: 'ห่อ', price: 25, cost: 21, stock: 20, barcode: '8852159100102', active: 1, lowStockThreshold: 5, branchId },

    { name: 'โค้ก 1.25 ลิตร', categoryId: catIds[4], unit: 'ขวด', price: 25, cost: 21, stock: 30, barcode: '8851132100105', active: 1, lowStockThreshold: 10, branchId },
    { name: 'โค้ก กระป๋อง', categoryId: catIds[4], unit: 'กระป๋อง', price: 15, cost: 12, stock: 48, barcode: '8851132100112', active: 1, lowStockThreshold: 12, branchId },
    { name: 'น้ำดื่มคริสตัล 600ml', categoryId: catIds[4], unit: 'ขวด', price: 10, cost: 7, stock: 60, barcode: '8850332100019', active: 1, lowStockThreshold: 20, branchId },
    { name: 'น้ำดื่มคริสตัล 1.5 ลิตร', categoryId: catIds[4], unit: 'ขวด', price: 18, cost: 14, stock: 36, barcode: '8850332100026', active: 1, lowStockThreshold: 12, branchId },
    { name: 'สปอนเซอร์ กระป๋อง', categoryId: catIds[4], unit: 'กระป๋อง', price: 12, cost: 10, stock: 36, barcode: '8850332100033', active: 1, lowStockThreshold: 12, branchId },

    { name: 'ยาสีฟันคอลเกต', categoryId: catIds[5], unit: 'หลอด', price: 45, cost: 38, stock: 18, barcode: '8850003100019', active: 1, lowStockThreshold: 6, branchId },
    { name: 'แปรงสีฟัน', categoryId: catIds[5], unit: 'อัน', price: 25, cost: 20, stock: 24, barcode: '8850003100026', active: 1, lowStockThreshold: 10, branchId },
    { name: 'สบู่เหลว ตรานก 250ml', categoryId: catIds[5], unit: 'ขวด', price: 55, cost: 47, stock: 15, barcode: '8850003100033', active: 1, lowStockThreshold: 6, branchId },
    { name: 'น้ำยาล้างจาน 400ml', categoryId: catIds[5], unit: 'ขวด', price: 38, cost: 32, stock: 16, barcode: '8850003100040', active: 1, lowStockThreshold: 6, branchId },
    { name: 'ถุงดำ 30x40 นิ้ว', categoryId: catIds[5], unit: 'มัด', price: 15, cost: 11, stock: 30, barcode: '8850003100057', active: 1, lowStockThreshold: 10, branchId },
  ])

  await db.customers.bulkAdd([
    { name: 'สมชาย ใจดี', phone: '081-234-5678', address: '123 หมู่ 1 ต.บางใหญ่ อ.บางใหญ่ จ.นนทบุรี', branchId },
    { name: 'สมหญิง รักดี', phone: '082-345-6789', address: '45 หมู่ 2 ต.บางพลู อ.บางใหญ่ จ.นนทบุรี', branchId },
    { name: 'ประวิทย์ การดี', phone: '083-456-7890', address: '789 ถ.รัตนาธิเบศร์ ต.บางกระสอ อ.เมือง จ.นนทบุรี', branchId },
    { name: 'นางสาวอรพิน สบายดี', phone: '084-567-8901', address: '567 หมู่ 5 ต.ไทรม้า อ.เมือง จ.นนทบุรี', branchId },
    { name: 'ร้านอาหารป้าสมศรี', phone: '085-678-9012', address: '89/1 ถ.ประชาราษฎร์ ต.บางซื่อ อ.บางซื่อ กรุงเทพฯ', branchId },
    { name: 'ร้านก๋วยเตี๋ยวสุภาพ', phone: '086-789-0123', address: '234 ซอยสุขสันต์ ต.บางเขน อ.เมือง จ.นนทบุรี', branchId },
  ])
}
