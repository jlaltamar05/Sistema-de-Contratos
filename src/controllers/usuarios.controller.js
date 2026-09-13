// Controlador de USUARIOS (vendedores, cobradores, administradores).

const supabase = require('../db/supabaseClient');

// GET /usuarios -> lista todos los usuarios (se puede filtrar por ?rol=vendedor)
async function listarUsuarios(req, res) {
  const { rol } = req.query;

  let query = supabase.from('usuarios').select('*').order('nombre', { ascending: true });
  if (rol) query = query.eq('rol', rol);

  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// GET /usuarios/:id -> un usuario específico
async function obtenerUsuario(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(data);
}

// POST /usuarios -> crear un usuario nuevo
async function crearUsuario(req, res) {
  const { nombre, email, rol } = req.body;

  if (!nombre || !email || !rol) {
    return res.status(400).json({ error: 'nombre, email y rol son obligatorios' });
  }

  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ nombre, email, rol }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}

// PUT /usuarios/:id -> actualizar un usuario existente
async function actualizarUsuario(req, res) {
  const { id } = req.params;
  const { nombre, email, rol, activo } = req.body;

  const { data, error } = await supabase
    .from('usuarios')
    .update({ nombre, email, rol, activo })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// DELETE /usuarios/:id -> eliminar un usuario
async function eliminarUsuario(req, res) {
  const { id } = req.params;

  const { error } = await supabase.from('usuarios').delete().eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
}

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};
