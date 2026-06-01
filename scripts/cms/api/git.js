import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function gitCommit(filePath, action, slug, collection) {
  try {
    let msg = '';
    if (action === 'create') {
      msg = `feat (Contenido) - Crear nueva entrada ${slug} en ${collection}`;
    } else if (action === 'update') {
      msg = `docs (Contenido) - Actualizar entrada ${slug} en ${collection}`;
    } else if (action === 'delete') {
      msg = `docs (Contenido) - Eliminar entrada ${slug} en ${collection}`;
    } else if (action === 'media') {
      msg = `feat (Assets) - Agregar imagen ${slug} en assets`;
    } else {
      msg = `chore (CMS) - Operación automática en ${filePath}`;
    }

    // git add
    await execPromise(`git add "${filePath}"`);
    // git commit
    const { stdout } = await execPromise(`git commit -m "${msg}"`);
    console.log(`✓ Git auto-commit ejecutado con éxito:\n${stdout.trim()}`);
    return { success: true, message: msg };
  } catch (err) {
    // Capturar de forma segura si no hay cambios reales para comitear
    if (err.message.includes('nothing to commit') || err.message.includes('no changes added to commit')) {
      console.log('ℹ Git auto-commit: Sin cambios para comitear.');
      return { success: true, message: 'Sin cambios para comitear' };
    }
    console.error('⚠ Error en Git auto-commit:', err.message);
    return { success: false, error: err.message };
  }
}

export async function gitPush() {
  try {
    console.log('🚀 Ejecutando Git Push asíncrono...');
    // Ejecutar git push
    const { stdout, stderr } = await execPromise('git push origin main');
    const logs = stdout.trim() + (stderr ? '\n' + stderr.trim() : '');
    console.log(`✓ Git Push exitoso:\n${logs}`);
    return { success: true, logs };
  } catch (err) {
    console.error('❌ Error en Git Push:', err.message);
    return { success: false, error: err.message };
  }
}
