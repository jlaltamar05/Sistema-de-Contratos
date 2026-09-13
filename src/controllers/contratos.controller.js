// Controlador de CONTRATOS.
// Maneja el encabezado del contrato y su detalle de productos.
// Al crear un contrato, se puede enviar el detalle junto en la misma
// petición (un arreglo "detalle"), y aquí se guarda en las dos tablas.

const supabase = require('../db/supabaseClient');

// GET /contratos -> lista todos los contratos (solo encabezado, sin detalle)
async function listarContratos(req, res) {
  const { data, error } = await supabase
    .from('contrato_encabezado')
    .select('*, clientes(nombre), usuarios(nombre)')
    .order('fecha_inicio', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// GET /contratos/:id -> un contrato con su detalle completo
async function obtenerContrato(req, res) {
  const { id } = req.params;

  const { data: encabezado, error: errorEncabezado } = await supabase
    .from('contrato_encabezado')
    .select('*, clientes(nombre), usuarios(nombre)')
    .eq('id', id)
    .single();

  if (errorEncabezado) {
    return res.status(404).json({ error: 'Contrato no encontrado' });
  }

  const { data: detalle, error: errorDetalle } = await supabase
    .from('contrato_detalle')
    .select('*, equipos(nombre, numero_serie)')
    .eq('contrato_id', id);

  if (errorDetalle) return res.status(500).json({ error: errorDetalle.message });

  res.json({ ...encabezado, detalle });
}

// POST /contratos -> crear un contrato nuevo, con su detalle opcional
async function crearContrato(req, res) {
  const {
    numero_contrato,
    cliente_id,
    vendedor_id,
    contrato_anterior_id,
    fecha_inicio,
    fecha_vencimiento,
    duracion_anos,
    frecuencia_pago,
    cantidad_cuotas,
    detalle, // arreglo opcional: [{ equipo_id, cantidad, precio_unitario }, ...]
  } = req.body;

  if (!numero_contrato || !cliente_id || !fecha_inicio || !fecha_vencimiento) {
    return res.status(400).json({
      error: 'numero_contrato, cliente_id, fecha_inicio y fecha_vencimiento son obligatorios',
    });
  }

  const { data: contrato, error: errorContrato } = await supabase
    .from('contrato_encabezado')
    .insert([{
      numero_contrato,
      cliente_id,
      vendedor_id,
      contrato_anterior_id,
      fecha_inicio,
      fecha_vencimiento,
      duracion_anos,
      frecuencia_pago,
      cantidad_cuotas,
    }])
    .select()
    .single();

  if (errorContrato) return res.status(500).json({ error: errorContrato.message });

  // Si vino detalle, lo insertamos ligado a este contrato recién creado
  if (Array.isArray(detalle) && detalle.length > 0) {
    const filasDetalle = detalle.map((item) => ({
      contrato_id: contrato.id,
      equipo_id: item.equipo_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
    }));

    const { error: errorDetalle } = await supabase
      .from('contrato_detalle')
      .insert(filasDetalle);

    if (errorDetalle) {
      // El contrato ya se creó, pero el detalle falló: se lo informamos
      // igual para que se pueda corregir sin perder el contrato.
      return res.status(207).json({
        contrato,
        advertencia: 'El contrato se creó pero hubo un error al guardar el detalle',
        error: errorDetalle.message,
      });
    }
  }

  res.status(201).json(contrato);
}

// PUT /contratos/:id -> actualizar datos del encabezado del contrato
async function actualizarContrato(req, res) {
  const { id } = req.params;
  const {
    numero_contrato,
    cliente_id,
    vendedor_id,
    fecha_inicio,
    fecha_vencimiento,
    duracion_anos,
    frecuencia_pago,
    cantidad_cuotas,
    estado,
  } = req.body;

  const { data, error } = await supabase
    .from('contrato_encabezado')
    .update({
      numero_contrato,
      cliente_id,
      vendedor_id,
      fecha_inicio,
      fecha_vencimiento,
      duracion_anos,
      frecuencia_pago,
      cantidad_cuotas,
      estado,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// DELETE /contratos/:id -> eliminar un contrato (y su detalle, por cascade)
async function eliminarContrato(req, res) {
  const { id } = req.params;

  const { error } = await supabase.from('contrato_encabezado').delete().eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
}

// POST /contratos/:id/detalle -> agregar un producto al detalle de un contrato existente
async function agregarDetalle(req, res) {
  const { id } = req.params;
  const { equipo_id, cantidad, precio_unitario } = req.body;

  if (!equipo_id || cantidad === undefined || precio_unitario === undefined) {
    return res.status(400).json({ error: 'equipo_id, cantidad y precio_unitario son obligatorios' });
  }

  const { data, error } = await supabase
    .from('contrato_detalle')
    .insert([{ contrato_id: id, equipo_id, cantidad, precio_unitario }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}

// DELETE /contratos/:id/detalle/:detalleId -> quitar un producto del detalle
async function eliminarDetalle(req, res) {
  const { detalleId } = req.params;

  const { error } = await supabase.from('contrato_detalle').delete().eq('id', detalleId);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
}

module.exports = {
  listarContratos,
  obtenerContrato,
  crearContrato,
  actualizarContrato,
  eliminarContrato,
  agregarDetalle,
  eliminarDetalle,
};
