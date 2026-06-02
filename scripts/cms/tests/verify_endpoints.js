import assert from 'assert';

console.log('🧪 Iniciando Suite de Pruebas de Regresión del CMS...');

const BASE_URL = 'http://localhost:43210';

async function runTests() {
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ TEST PASSED: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ TEST FAILED: ${name}`);
      console.error(err);
      failed++;
    }
  }

  // Test 1: Verificar el endpoint de contenidos
  await test('GET /api/content', async () => {
    const res = await fetch(`${BASE_URL}/api/content`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.blog, 'Debe contener la colección de blog');
    assert.ok(data.projects, 'Debe contener la colección de proyectos');
    assert.ok(Array.isArray(data.blog), 'Blog debe ser un array');
  });

  // Test 2: Verificar el endpoint de carpetas de media
  await test('GET /api/media-folders', async () => {
    const res = await fetch(`${BASE_URL}/api/media-folders`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data), 'Carpetas de media debe ser un array');
    const imagesFolder = data.find(f => f.name === 'images');
    assert.ok(imagesFolder, 'Debe existir la carpeta "images"');
  });

  // Test 3: Verificar el nuevo endpoint de archivos de media
  await test('GET /api/media-files?targetDir=images/posts', async () => {
    const res = await fetch(`${BASE_URL}/api/media-files?targetDir=images/posts`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data), 'Archivos de media debe ser un array');
    assert.ok(data.length > 0, 'images/posts debe contener al menos un archivo');
    assert.ok(data[0].name, 'El objeto de archivo debe contener la propiedad "name"');
    assert.ok(data[0].relativePath, 'El objeto de archivo debe contener la propiedad "relativePath"');
  });

  // Test 4: Verificar comprobación de existencia de archivo
  await test('GET /api/media/check-exists', async () => {
    const res = await fetch(`${BASE_URL}/api/media/check-exists?targetDir=images/posts&filename=rpa.png`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.exists, true, 'El archivo "rpa.png" debe existir');
  });

  // Test 5: Verificar endpoint de componentes personalizados
  await test('GET /api/custom-components', async () => {
    const res = await fetch(`${BASE_URL}/api/custom-components`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.components), 'Debería retornar un array de componentes');
  });

  console.log('\n--- RESUMEN DE PRUEBAS ---');
  console.log(`Pruebas Exitosas: ${passed}`);
  console.log(`Pruebas Fallidas: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ¡Todas las pruebas de regresión pasaron con éxito!');
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
