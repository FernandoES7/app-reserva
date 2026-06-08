const fmt = (n) =>
  `S/ ${Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatFecha = (f) => {
  if (!f) return '—';
  const s = typeof f === 'string' ? f.slice(0, 10) : f;
  const [y, m, d] = s.split('-');
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
};

const formatFechaHora = (f) => {
  const d = new Date(f);
  if (Number.isNaN(d.getTime())) return formatFecha(f);
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ESTADO_LABEL = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada',
};

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function hotelBlock(hotel, compact = false) {
  const size = compact ? '12px' : '14px';
  const nameSize = compact ? '13px' : '16px';
  return `
    <div style="font-size:${size};color:#4b5563;line-height:1.5;">
      <p style="margin:0;font-size:${nameSize};font-weight:800;color:#1e3a5f;">${esc(hotel.nombre)}</p>
      ${hotel.categoria ? `<p style="margin:2px 0 0;color:#9ca3af;font-size:11px;text-transform:capitalize;">${esc(hotel.categoria)}</p>` : ''}
      <p style="margin:${compact ? '4px' : '8px'} 0 0;">${esc(hotel.direccion)}</p>
      <p style="margin:0;">Tel: ${esc(hotel.telefono || '—')} · ${esc(hotel.email || '—')}</p>
    </div>
  `;
}

export function buildBoletaPrintHtml({ reserva, hotel, noches, totalBoleta, checkin, checkout }) {
  const habitacionesRows = (reserva.habitaciones || [])
    .map((h) => {
      const subtotal = Number(h.precio_noche) * noches;
      return `
        <tr>
          <td>${esc(h.tipo_nombre || h.tipo_habitacion)}</td>
          <td>Hab. <strong>${esc(h.numero)}</strong> · Piso ${esc(h.piso)}</td>
          <td style="text-align:right;">${fmt(h.precio_noche)}</td>
          <td style="text-align:right;font-weight:600;color:#1e3a5f;">${fmt(subtotal)}</td>
        </tr>
      `;
    })
    .join('');

  const habitacionesSection =
    reserva.habitaciones?.length > 0
      ? `
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>N° / Piso</th>
              <th style="text-align:right;">Precio/noche</th>
              <th style="text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${habitacionesRows}</tbody>
        </table>
      `
      : '<p class="muted">Sin detalle de habitaciones asignadas.</p>';

  const titulo = `Comprobante ${reserva.codigo_reserva}`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${esc(titulo)}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      color: #374151;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .wrap { display: flex; min-height: 0; }
    .sidebar {
      width: 36px;
      background: #1e3a5f;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .sidebar span {
      color: #fff;
      font-weight: 800;
      font-size: 12px;
      letter-spacing: 0.35em;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
    }
    .content { flex: 1; padding: 20px 24px; }
    header { border-bottom: 2px solid #1e3a5f; padding-bottom: 16px; margin-bottom: 20px; }
    footer { border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 20px; text-align: center; }
    h2 {
      margin: 0 0 12px;
      font-size: 10px;
      font-weight: 800;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px; }
    dl { margin: 0; }
    .row { display: flex; gap: 8px; margin-bottom: 6px; font-size: 13px; }
    .row dt { color: #9ca3af; flex-shrink: 0; }
    .row dd { margin: 0; color: #374151; }
    .row dd strong, .mono { font-family: ui-monospace, monospace; font-weight: 700; color: #1e3a5f; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #f3f4f6; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
    th, td { padding: 8px 12px; text-align: left; font-size: 12px; }
    thead tr { background: #f9fafb; }
    th { font-size: 10px; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
    tbody tr { border-top: 1px solid #f9fafb; }
    .total-box {
      background: rgba(30, 58, 95, 0.05);
      border: 1px solid rgba(30, 58, 95, 0.1);
      border-radius: 10px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 8px;
    }
    .total-box .amount { font-size: 28px; font-weight: 800; color: #f59e0b; }
    .muted { color: #9ca3af; font-size: 13px; background: #f9fafb; padding: 12px 16px; border-radius: 8px; }
    .foot-note { font-size: 11px; color: #9ca3af; margin-top: 10px; }
    @media print {
      body { margin: 0; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="sidebar"><span>BOLETA</span></div>
    <div class="content">
      <header>${hotelBlock(hotel)}</header>

      <div class="grid">
        <section>
          <h2>Datos del huésped</h2>
          <dl>
            <div class="row"><dt>Nombre:</dt><dd><strong>${esc(reserva.cliente_nombre || '—')}</strong></dd></div>
            <div class="row"><dt>Documento:</dt><dd>${esc(reserva.documento || '—')}</dd></div>
            <div class="row"><dt>Email:</dt><dd>${esc(reserva.email || '—')}</dd></div>
            <div class="row"><dt>Teléfono:</dt><dd>${esc(reserva.telefono || '—')}</dd></div>
          </dl>
        </section>
        <section>
          <h2>Detalle de la reserva</h2>
          <dl>
            <div class="row"><dt>Código:</dt><dd class="mono">${esc(reserva.codigo_reserva)}</dd></div>
            ${reserva.factura?.numero_factura ? `<div class="row"><dt>N° boleta:</dt><dd class="mono">${esc(reserva.factura.numero_factura)}</dd></div>` : ''}
            <div class="row"><dt>Estado:</dt><dd>${esc(ESTADO_LABEL[reserva.estado] || reserva.estado)}</dd></div>
            <div class="row"><dt>Fecha reserva:</dt><dd>${formatFecha(reserva.fecha_reserva || reserva.created_at)}</dd></div>
            <div class="row"><dt>Check-in:</dt><dd>${checkin}</dd></div>
            <div class="row"><dt>Check-out:</dt><dd>${checkout}</dd></div>
            <div class="row"><dt>Huéspedes:</dt><dd>${esc(reserva.num_huespedes)}</dd></div>
            <div class="row"><dt>Noches:</dt><dd>${noches}</dd></div>
          </dl>
        </section>
      </div>

      <section>
        <h2>Habitaciones reservadas</h2>
        ${habitacionesSection}
      </section>

      <div class="total-box">
        <div>
          <p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">Total de la boleta</p>
          ${
            reserva.factura
              ? `<p style="margin:0;font-size:11px;color:#6b7280;">Subtotal ${fmt(reserva.factura.subtotal)}${
                  Number(reserva.factura.impuestos) > 0 ? ` · IGV ${fmt(reserva.factura.impuestos)}` : ''
                }</p>`
              : ''
          }
        </div>
        <p class="amount">${fmt(totalBoleta)}</p>
      </div>

      <footer>
        ${hotelBlock(hotel, true)}
        <p class="foot-note">Documento generado el ${formatFechaHora(new Date())} · Gracias por su preferencia</p>
      </footer>
    </div>
  </div>
</body>
</html>`;
}

export function printBoleta(data) {
  const html = buildBoletaPrintHtml(data);
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  doc.open();
  doc.write(html);
  doc.close();

  window.setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      window.setTimeout(() => iframe.remove(), 500);
    }
  }, 300);
}
