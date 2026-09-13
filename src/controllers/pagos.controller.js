// Controlador de PAGOS (cuotas de un contrato).

const supabase = require('../db/supabaseClient');

// GET /pagos -> lista pagos, filtrable por ?contrato_id=... y/o ?estado=...
async function listarPagos(req, res) {
  const { contrato_id, estado } = req.query;

  let query = supabase
    .from('pagos')
    .select('*, contrato_encabezado(numero_contrato)')
    .order('fecha_vencimiento', { ascending: true });

  if (contrato_id) query = query.eq('contrato_id', contrato_id);
  if (estado) query = query.eq('estado', estado);

  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// GET /pagos/:id -> un pago específico
async function obtenerPago(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('pagos')
    .select('*, contrato_encabezado(numero_contrato)')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ error: 'Pago no encontrado' });
  res.json(data);
}

// POST /pagos -> crear un pago/cuota individual
async function crearPago(req, res) {
  const { contrato_id, cobrador_id, numero_cuota, fecha_vencimiento, monto } = req.body;

  if (!contrato_id || !numero_cuota || !fecha_vencimiento || monto === undefined) {
    return res.status(400).json({
      error: 'contrato_id, numero_cuota, fecha_vencimiento y monto son obligatorios',
    });
  }

  const { data, error } = await supabase
    .from('pagos')
    .insert([{ contrato_id, cobrador_id, numero_cuota, fecha_vencimiento, monto }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}

// POST /pagos/generar/:contratoId -> genera TODAS las cuotas de un contrato
// de una sola vez, según su duracion_anos y frecuencia_pago.
// Body esperado: { monto_cuota: number }
async function generarCuotas(req, res) {
  const { contratoId } = req.params;
  const { monto_cuota } = req.body;

  if (monto_cuota === undefined) {
    return res.status(400).json({ error: 'monto_cuota es obligatorio' });
  }

  const { data: contrato, error: errorContrato } = await supabase
    .from('contrato_encabezado')
    .select('fecha_inicio, cantidad_cuotas, frecuencia_pago')
    .eq('id', contratoId)
    .single();

  if (errorContrato) return res.status(404).json({ error: 'Contrato no encontrado' });

  const mesesPorFrecuencia = { mensual: 1, bimensual: 2, semestral: 6 };
  const intervaloMeses = mesesPorFrecuencia[contrato.frecuencia_pago] || 1;

  const cuotas = [];
  const fechaBase = new Date(contrato.fecha_inicio);

  for (let i = 0; i < contrato.cantidad_cuotas; i++) {
    const fechaVencimiento = new Date(fechaBase);
    fechaVencimiento.setMonth(fechaBase.getMonth() + intervaloMeses * (i + 1));

    cuotas.push({
      contrato_id: contratoId,
      numero_cuota: i + 1,
      fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
      monto: monto_cuota,
    });
  }

  const { data, error } = await supabase.from('pagos').insert(cuotas).select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}

// PUT /pagos/:id/pagar -> marca un pago como pagado
async function marcarComoPagado(req, res) {
  const { id } = req.params;
  const { fecha_pago, cobrador_id } = req.body;

  const { data, error } = await supabase
    .from('pagos')
    .update({
      estado: 'pagado',
      fecha_pago: fecha_pago || new Date().toISOString().split('T')[0],
      cobrador_id,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// PUT /pagos/:id -> actualizar un pago
async function actualizarPago(req, res) {
  const { id } = req.params;
  const { fecha_vencimiento, fecha_pago, monto, estado, cobrador_id } = req.body;

  const { data, error } = await supabase
    .from('pagos')
    .update({ fecha_vencimiento, fecha_pago, monto, estado, cobrador_id })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// DELETE /pagos/:id -> eliminar un pago
async function eliminarPago(req, res) {
  const { id } = req.params;

  const { error } = await supabase.from('pagos').delete().eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
}

module.exports = {
  listarPagos,
  obtenerPago,
  crearPago,
  generarCuotas,
  marcarComoPagado,
  actualizarPago,
  eliminarPago,
};
