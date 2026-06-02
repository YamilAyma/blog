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

export async function gitSquashAndPush() {
  try {
    console.log('🗜️ Iniciando proceso de aplanado de historial (Squash) y subida (Push)...');

    // 1. Auto-detectar la rama de seguimiento remota
    let upstreamBranch = 'origin/main';
    try {
      const { stdout } = await execPromise('git rev-parse --abbrev-ref @{u}');
      if (stdout && stdout.trim()) {
        upstreamBranch = stdout.trim();
      }
    } catch (e) {
      console.log('ℹ No se pudo auto-detectar la rama de seguimiento remota. Usando origin/main por defecto.');
    }

    // 2. Obtener la lista de commits locales pendientes de subir
    let commitsList = '';
    try {
      const { stdout } = await execPromise(`git log ${upstreamBranch}..HEAD --format="- %s"`);
      commitsList = stdout.trim();
    } catch (e) {
      console.log(`ℹ No se pudo obtener el historial de commits o estás al día con ${upstreamBranch}.`);
    }

    if (!commitsList) {
      console.log('ℹ Sin commits locales pendientes para aplanar. Intentando push directo.');
      const pushRes = await gitPush();
      return pushRes;
    }

    // 3. Ejecutar soft reset contra la rama remota
    await execPromise(`git reset --soft ${upstreamBranch}`);

    // 4. Crear el commit unificado con los mensajes recopilados en la descripción
    const mainMsg = 'docs (Contenido) - Consolidar y aplanar cambios locales del blog';
    const bodyMsg = `[Historial de cambios de la sesión]:\n${commitsList}`;
    
    // Escapar comillas para la consola
    const safeMainMsg = mainMsg.replace(/"/g, '\\"');
    const safeBodyMsg = bodyMsg.replace(/"/g, '\\"');

    await execPromise(`git commit -m "${safeMainMsg}" -m "${safeBodyMsg}"`);
    console.log('✓ Squash completado con éxito localmente.');

    // 5. Ejecutar el push
    const pushRes = await gitPush();
    return {
      success: pushRes.success,
      logs: `Aplanamiento exitoso.\n\n${pushRes.logs || pushRes.error}`
    };
  } catch (err) {
    console.error('❌ Error en Finalizar Redacción (Squash & Push):', err.message);
    return { success: false, error: err.message };
  }
}
