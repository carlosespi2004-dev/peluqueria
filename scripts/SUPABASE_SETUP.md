# Configuración de Supabase usando CLI

Si prefieres configurar la base de datos desde la terminal en lugar del SQL Editor, sigue estos pasos:

1. Instala la CLI de Supabase:

   ```bash
   npm install -g supabase
   ```

2. Inicia sesión:

   ```bash
   supabase login
   ```

3. Conecta el proyecto remoto:

   ```bash
   export SUPABASE_PROJECT_REF="tu-proyecto-ref"
   supabase link --project-ref "$SUPABASE_PROJECT_REF"
   ```

   En PowerShell usa:

   ```powershell
   $env:SUPABASE_PROJECT_REF = 'tu-proyecto-ref'
   supabase link --project-ref $env:SUPABASE_PROJECT_REF
   ```

4. Aplica el esquema de `supabase.sql`:

   ```bash
   supabase db push --file ./supabase.sql
   ```

5. Si el comando anterior no funciona, abre el SQL Editor en el dashboard y pega el contenido de `supabase.sql`.

6. Crea un archivo `.env` local copiando `.env.example` y reemplazando el valor de las variables con los datos de tu proyecto.

   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
   VITE_APP_PASSWORD=tu-contraseña-segura
   ```

7. Ejecuta la app:

   ```bash
   npm install
   npm run dev
   ```
