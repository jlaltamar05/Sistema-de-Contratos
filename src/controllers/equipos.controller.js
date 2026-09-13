// Controlador de EQUIPOS.
// Incluye los campos de depreciación (fecha_adquisicion, valor_adquisicion,
// vida_util_anos) y la relación con línea de producto.

const supabase = require('../db/supabaseClient');

// GET /equipos -> lista todos los equipos
async function listarEquipos(req, res) {
  const { data, error } = await supabase
    .from('equipos')
    .select('*, lineas_producto(nombre)')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// GET /equipos/:id -> un equipo específico
async function obtenerEquipo(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('equipos')
    .select('*, lineas_producto(nombre)')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ error: 'Equipo no encontrado' });
  res.json(data);
}

// POST /equipos -> crear un equipo nuevo
async function crearEquipo(req, res) {
  const {
    linea_producto_id,
    nombre,
    tipo,
    marca,
    modelo,
    numero_serie,
    fecha_adquisicion,
    valor_adquisicion,
    vida_util_anos,
    estado,
  } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'nombre es obligatorio' });
  }

  const { data, error } = await supabase
    .from('equipos')
    .insert([{
      linea_producto_id,
      nombre,
      tipo,
      marca,
      modelo,
      numero_serie,
      fecha_adquisicion,
      valor_adquisicion,
      vida_util_anos,
      estado: estado || 'disponible',
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}

// PUT /equipos/:id -> actualizar un equipo existente
async function actualizarEquipo(req, res) {
  const { id } = req.params;
  const {
    linea_producto_id,
    nombre,
    tipo,
    marca,
    modelo,
    numero_serie,
    fecha_adquisicion,
    valor_adquisicion,
    vida_util_anos,
    estado,
  } = req.body;

  const { data, error } = await supabase
    .from('equipos')
    .update({
      linea_producto_id,
      nombre,
      tipo,
      marca,
      modelo,
      numero_serie,
      fecha_adquisicion,
      valor_adquisicion,
      vida_util_anos,
      estado,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// DELETE /equipos/:id -> eliminar un equipo
async function eliminarEquipo(req, res) {
  const { id } = req.params;

  const { error } = await supabase.from('equipos').delete().eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
}

module.exports = {
  listarEquipos,
  obtenerEquipo,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo,
};
