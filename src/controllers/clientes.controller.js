// Controlador de CLIENTES.
// Cada función maneja una operación CRUD sobre la tabla "clientes".

const supabase = require('../db/supabaseClient');

// GET /clientes -> lista todos los clientes
async function listarClientes(req, res) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// GET /clientes/:id -> un cliente específico
async function obtenerCliente(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(data);
}

// POST /clientes -> crear un cliente nuevo
async function crearCliente(req, res) {
  const { nombre, documento, contacto, direccion } = req.body;

  if (!nombre || !documento) {
    return res.status(400).json({ error: 'nombre y documento son obligatorios' });
  }

  const { data, error } = await supabase
    .from('clientes')
    .insert([{ nombre, documento, contacto, direccion }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}

// PUT /clientes/:id -> actualizar un cliente existente
async function actualizarCliente(req, res) {
  const { id } = req.params;
  const { nombre, documento, contacto, direccion } = req.body;

  const { data, error } = await supabase
    .from('clientes')
    .update({ nombre, documento, contacto, direccion })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// DELETE /clientes/:id -> eliminar un cliente
async function eliminarCliente(req, res) {
  const { id } = req.params;

  const { error } = await supabase.from('clientes').delete().eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
}

module.exports = {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
};
