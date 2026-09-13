// Controlador de LINEAS DE PRODUCTO.
// Define el % de comisión de venta y cobro para cada línea.

const supabase = require('../db/supabaseClient');

// GET /lineas-producto -> lista todas las líneas
async function listarLineas(req, res) {
  const { data, error } = await supabase
    .from('lineas_producto')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// GET /lineas-producto/:id -> una línea específica
async function obtenerLinea(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('lineas_producto')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ error: 'Línea de producto no encontrada' });
  res.json(data);
}

// POST /lineas-producto -> crear una línea nueva
async function crearLinea(req, res) {
  const { nombre, porcentaje_comision_venta, porcentaje_comision_cobro } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'nombre es obligatorio' });
  }

  const { data, error } = await supabase
    .from('lineas_producto')
    .insert([{
      nombre,
      porcentaje_comision_venta: porcentaje_comision_venta || 0,
      porcentaje_comision_cobro: porcentaje_comision_cobro || 0,
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}

// PUT /lineas-producto/:id -> actualizar una línea existente
async function actualizarLinea(req, res) {
  const { id } = req.params;
  const { nombre, porcentaje_comision_venta, porcentaje_comision_cobro } = req.body;

  const { data, error } = await supabase
    .from('lineas_producto')
    .update({ nombre, porcentaje_comision_venta, porcentaje_comision_cobro })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// DELETE /lineas-producto/:id -> eliminar una línea
async function eliminarLinea(req, res) {
  const { id } = req.params;

  const { error } = await supabase.from('lineas_producto').delete().eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
}

module.exports = {
  listarLineas,
  obtenerLinea,
  crearLinea,
  actualizarLinea,
  eliminarLinea,
};
