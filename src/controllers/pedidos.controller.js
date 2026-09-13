// Controlador de PEDIDOS.
// Un pedido puede ser: arrendamiento (inicial), venta, ampliacion,
// devolucion o renovacion. Cuando se anexa a un contrato, queda
// relacionado vía contrato_id y su estado pasa a "inactivo".

const supabase = require('../db/supabaseClient');

// GET /pedidos -> lista todos los pedidos
// Se puede filtrar por ?cliente_id=... o por ?estado=activo/inactivo
async function listarPedidos(req, res) {
  const { cliente_id, estado, contrato_id } = req.query;

  let query = supabase
    .from('pedido_encabezado')
    .select('*, clientes(nombre)')
    .order('fecha_pedido', { ascending: false });

  if (cliente_id) query = query.eq('cliente_id', cliente_id);
  if (estado) query = query.eq('estado', estado);
  if (contrato_id) query = query.eq('contrato_id', contrato_id);

  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// GET /pedidos/:id -> un pedido con su detalle
async function obtenerPedido(req, res) {
  const { id } = req.params;

  const { data: encabezado, error: errorEncabezado } = await supabase
    .from('pedido_encabezado')
    .select('*, clientes(nombre)')
    .eq('id', id)
    .single();

  if (errorEncabezado) return res.status(404).json({ error: 'Pedido no encontrado' });

  const { data: detalle, error: errorDetalle } = await supabase
    .from('pedido_detalle')
    .select('*, equipos(nombre, numero_serie)')
    .eq('pedido_id', id);

  if (errorDetalle) return res.status(500).json({ error: errorDetalle.message });

  res.json({ ...encabezado, detalle });
}

// POST /pedidos -> crear un pedido nuevo, con su detalle de productos
// tipo_pedido: 'arrendamiento' | 'venta' | 'ampliacion' | 'devolucion' | 'renovacion'
// Para devoluciones, envía "cantidad" en negativo en cada línea del detalle.
async function crearPedido(req, res) {
  const { cliente_id, cotizacion_id, contrato_id, tipo_pedido, detalle } = req.body;

  if (!cliente_id || !tipo_pedido) {
    return res.status(400).json({ error: 'cliente_id y tipo_pedido son obligatorios' });
  }

  const { data: pedido, error: errorPedido } = await supabase
    .from('pedido_encabezado')
    .insert([{ cliente_id, cotizacion_id, contrato_id, tipo_pedido }])
    .select()
    .single();

  if (errorPedido) return res.status(500).json({ error: errorPedido.message });

  if (Array.isArray(detalle) && detalle.length > 0) {
    const filasDetalle = detalle.map((item) => ({
      pedido_id: pedido.id,
      equipo_id: item.equipo_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
    }));

    const { error: errorDetalle } = await supabase
      .from('pedido_detalle')
      .insert(filasDetalle);

    if (errorDetalle) {
      return res.status(207).json({
        pedido,
        advertencia: 'El pedido se creó pero hubo un error al guardar el detalle',
        error: errorDetalle.message,
      });
    }
  }

  res.status(201).json(pedido);
}

// PUT /pedidos/:id/anexar -> anexa el pedido a un contrato y lo deja inactivo
// Este es el paso que reemplaza el flujo manual que describiste: seleccionar
// el pedido y que sus detalles queden ligados al contrato.
async function anexarAContrato(req, res) {
  const { id } = req.params;
  const { contrato_id } = req.body;

  if (!contrato_id) {
    return res.status(400).json({ error: 'contrato_id es obligatorio' });
  }

  const { data, error } = await supabase
    .from('pedido_encabezado')
    .update({ contrato_id, estado: 'inactivo' })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// PUT /pedidos/:id -> actualizar datos generales del pedido (no el detalle)
async function actualizarPedido(req, res) {
  const { id } = req.params;
  const { tipo_pedido, estado } = req.body;

  const { data, error } = await supabase
    .from('pedido_encabezado')
    .update({ tipo_pedido, estado })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// DELETE /pedidos/:id -> eliminar un pedido (y su detalle, por cascade)
async function eliminarPedido(req, res) {
  const { id } = req.params;

  const { error } = await supabase.from('pedido_encabezado').delete().eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
}

module.exports = {
  listarPedidos,
  obtenerPedido,
  crearPedido,
  anexarAContrato,
  actualizarPedido,
  eliminarPedido,
};
