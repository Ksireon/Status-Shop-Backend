const bcrypt = require('bcrypt');

const users = [
  { email: 'owner@status.uz', password: 'Status_shop_owner123', role: 'OWNER', name: 'Owner' },
  { email: 'director@status.uz', password: 'Status_shop_director123', role: 'BRANCH_DIRECTOR', name: 'Director' },
  { email: 'manager@status.uz', password: 'Status_shop_manager123', role: 'MANAGER', name: 'Manager' }
];

async function generateSQL() {
  console.log('-- Run this SQL in pgAdmin to add admin users\n');
  console.log('-- First, verify you have a shop:');
  console.log('SELECT id FROM "Shop" LIMIT 1;\n');
  console.log('-- Then run these INSERT statements:\n');
  
  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 10);
    console.log(`INSERT INTO "User" (id, email, "passwordHash", role, name, "isActive", "createdAt", "updatedAt", "shopId")`);
    console.log(`VALUES (gen_random_uuid(), '${user.email}', '${hash}', '${user.role}', '${user.name}', true, NOW(), NOW(), (SELECT id FROM "Shop" LIMIT 1));`);
    console.log();
  }
}

generateSQL();
