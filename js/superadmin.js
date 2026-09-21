// Panel de super-admin: acá el dueño de Bus Coin (no una agencia en
// particular) ve todas las agencias juntas, cuántos viajes y comercios
// tiene cada una, y marca a mano si están al día con el pago — mientras
// no haya cobro automático, esto reemplaza a una planilla aparte.
//
// Solo lo ve una cuenta con usuarios/{uid}/superadmin = true (se marca a
// mano en la base, igual que se da de alta una agencia nueva).

let superAdminMostrando = false;
let superAdminDatos = null;

function mostrarPanelSuperAdmin(){
  superAdminMostrando = true;
  renderPanelSuperAdmin();
}

function renderPanelSuperAdmin(){
  const cont = document.getElementById('superadmin-content');
  if(!cont) return;
  if(!superAdminMostrando){ cont.innerHTML = ''; return; }

  if(!agenciasEsOrganizador()){
    cont.innerHTML = agenciasFormularioLoginHTML('superadmin', 'superAdminAlLoguear');
    return;
  }
  if(!esSuperAdmin){
    cont.innerHTML = '<p class="bingo-pin-error">Esta cuenta no tiene acceso al panel general.</p>';
    return;
  }

  cont.innerHTML = `<p class="link-chico">Conectado como ${agenciaActualNombre}. <span onclick="agenciasCerrarSesion()" style="text-decoration:underline;cursor:pointer;">Cerrar sesión</span></p><p style="color:var(--gray);font-size:13px;">Cargando agencias...</p>`;
  superAdminCargarTodo();
}

function superAdminAlLoguear(){
  renderPanelSuperAdmin();
}

function superAdminCargarTodo(){
  db.ref('agencias').once('value').then(snap => {
    const agencias = snap.val() || {};
    const ids = Object.keys(agencias);
    return Promise.all(ids.map(id => {
      const comerciosPorDestino = agencias[id].comercios || {};
      const cantComercios = Object.values(comerciosPorDestino)
        .reduce((total, catalogo) => total + Object.keys(catalogo || {}).length, 0);
      return db.ref('salas').orderByChild('agenciaId').equalTo(id).once('value').then(snapSalas => ({
        id,
        nombre: agencias[id].nombre || id,
        estadoPago: agencias[id].estadoPago || {},
        cantComercios,
        cantViajes: snapSalas.numChildren(),
      }));
    }));
  }).then(filas => {
    // Si mientras cargaba se cerró sesión (o se sacó el acceso de superadmin),
    // esta respuesta ya está vieja: no pisar la pantalla actual con esto.
    if(!agenciasEsOrganizador() || !esSuperAdmin) return;
    superAdminDatos = filas.sort((a, b) => a.nombre.localeCompare(b.nombre));
    superAdminRenderTabla();
  });
}

function superAdminRenderTabla(){
  const cont = document.getElementById('superadmin-content');
  if(!cont || !superAdminDatos) return;

  const filasHTML = superAdminDatos.map(f => {
    const activo = f.estadoPago.activo !== false; // sin dato = se asume al día
    return `<div class="comercio-admin-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-size:16px; color:var(--navy);">${f.nombre}</h3>
        <span style="font-size:11px; color:var(--gray);">${f.id}</span>
      </div>
      <p style="font-size:12.5px; color:var(--gray); margin:4px 0 8px;">${f.cantViajes} viaje${f.cantViajes === 1 ? '' : 's'} · ${f.cantComercios} comercio${f.cantComercios === 1 ? '' : 's'} cargado${f.cantComercios === 1 ? '' : 's'}</p>
      <label class="comercio-admin-checkbox">
        <input type="checkbox" id="sa-activo-${f.id}" ${activo ? 'checked' : ''}> Al día con el pago
      </label>
      <input type="text" id="sa-notas-${f.id}" class="bingo-input-numero" style="width:100%;" placeholder="Notas (ej: transferencia 10/09, vence el 10 de cada mes)" value="${(f.estadoPago.notas || '').replace(/"/g, '&quot;')}">
      <button class="btn-ghost" style="margin-top:6px;" onclick="superAdminGuardarEstado('${f.id}')">Guardar</button>
    </div>`;
  }).join('');

  cont.innerHTML = `
    <p class="link-chico">Conectado como ${agenciaActualNombre}. <span onclick="agenciasCerrarSesion()" style="text-decoration:underline;cursor:pointer;">Cerrar sesión</span></p>
    <div class="section-label">Agencias (${superAdminDatos.length})</div>
    ${filasHTML || '<p style="color:var(--gray);font-size:13px;">Todavía no hay agencias cargadas.</p>'}`;
}

function superAdminGuardarEstado(agenciaId){
  const activo = document.getElementById(`sa-activo-${agenciaId}`).checked;
  const notas = document.getElementById(`sa-notas-${agenciaId}`).value.trim();
  db.ref('agencias/' + agenciaId + '/estadoPago').set({
    activo,
    notas,
    actualizado: Date.now(),
  }).then(() => mostrarToast('Estado guardado'));
}
