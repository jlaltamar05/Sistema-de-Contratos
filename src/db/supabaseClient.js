// Conexión centralizada a Supabase.
// Todos los controladores importan este mismo cliente para no repetir
// la configuración en cada archivo.

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Faltan SUPABASE_URL o SUPABASE_KEY en el archivo .env. Revisa .env.example.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
