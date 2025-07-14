import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Interfaces para los tipos de datos en los archivos de semilla
interface Role {
  name: string;
  description: string;
}

interface CustomerType {
  name: string;
  description: string;
}

interface ShippingMethod {
  name: string;
  description: string;
}

interface User {
  email: string;
  password: string;
  role_id: number;
}

interface VoysStatus {
  name: string;
  slug: string;
  ml_status_array: string[];
}

// Función auxiliar para leer archivos JSON
async function readJsonFile<T>(filePath: string): Promise<T[]> {
  try {
    const fullPath = path.resolve(__dirname, filePath);
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(fileContent) as T[];
  } catch (error) {
    console.error(`Error al leer el archivo ${filePath}:`, error);
    return [];
  }
}

// Función para hashear contraseñas
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Función principal para sembrar datos
async function seed() {
  try {
    console.log('🌱 Iniciando proceso de siembra de datos...');

    // Sembrar roles
    const rolesData = await readJsonFile<Role>('roles.seed.json');
    console.log(`📚 Sembrando ${rolesData.length} roles...`);
    for (const role of rolesData) {
      await prisma.role.upsert({
        where: { name: role.name },
        update: { description: role.description },
        create: {
          name: role.name,
          description: role.description,
        },
      });
    }

    // Sembrar tipos de cliente
    const customerTypesData = await readJsonFile<CustomerType>('customer-types.seed.json');
    console.log(`👥 Sembrando ${customerTypesData.length} tipos de cliente...`);
    for (const customerType of customerTypesData) {
      await prisma.customerType.upsert({
        where: { name: customerType.name },
        update: { description: customerType.description },
        create: {
          name: customerType.name,
          description: customerType.description,
        },
      });
    }

    // Sembrar métodos de envío
    const shippingMethodsData = await readJsonFile<ShippingMethod>('shipping-methods.seed.json');
    console.log(`🚚 Sembrando ${shippingMethodsData.length} métodos de envío...`);
    for (const shippingMethod of shippingMethodsData) {
      await prisma.shippingMethod.upsert({
        where: { name: shippingMethod.name },
        update: { description: shippingMethod.description },
        create: {
          name: shippingMethod.name,
          description: shippingMethod.description,
        },
      });
    }

    // Sembrar estados de Voys
    const voysStatusData = await readJsonFile<VoysStatus>('voys-status.seed.json');
    console.log(`🚦 Sembrando ${voysStatusData.length} estados de Voys...`);
    for (const status of voysStatusData) {
      await prisma.voysStatus.upsert({
        where: { slug: status.slug },
        update: {
          name: status.name,
          ml_status_array: JSON.stringify(status.ml_status_array),
        },
        create: {
          name: status.name,
          slug: status.slug,
          ml_status_array: JSON.stringify(status.ml_status_array),
        },
      });
    }

    // Sembrar usuarios
    const usersData = await readJsonFile<User>('users.seed.json');
    console.log(`👤 Sembrando ${usersData.length} usuarios...`);
    for (const user of usersData) {
      const hashedPassword = await hashPassword(user.password);
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          password: hashedPassword,
          role_id: user.role_id,
        },
        create: {
          email: user.email,
          password: hashedPassword,
          role_id: user.role_id,
        },
      });
    }

    console.log('✅ Proceso de siembra completado con éxito!');
  } catch (error) {
    console.error('❌ Error durante el proceso de siembra:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar función de siembra
seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
