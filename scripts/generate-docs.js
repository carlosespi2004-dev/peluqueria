import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const doc = new PDFDocument({ bufferPages: true, margin: 40 });
const outputPath = path.join(__dirname, '../docs-sistema.pdf');
const stream = fs.createWriteStream(outputPath);

doc.pipe(stream);

// Función auxiliar para agregar secciones
function addSection(title, content = []) {
  doc.fontSize(18).font('Helvetica-Bold').text(title, { underline: true });
  doc.moveDown(0.5);
  
  content.forEach(line => {
    if (line.type === 'heading') {
      doc.fontSize(14).font('Helvetica-Bold').text(line.text);
      doc.moveDown(0.3);
    } else if (line.type === 'bullet') {
      doc.fontSize(11).font('Helvetica').text(`• ${line.text}`, { indent: 20 });
      doc.moveDown(0.2);
    } else if (line.type === 'text') {
      doc.fontSize(11).font('Helvetica').text(line.text, { align: 'justify' });
      doc.moveDown(0.3);
    } else if (line.type === 'space') {
      doc.moveDown(line.amount || 0.5);
    }
  });
}

// PORTADA
doc.fontSize(28).font('Helvetica-Bold').text('BARBERÍA ROMAN', { align: 'center' });
doc.moveDown(0.5);
doc.fontSize(16).font('Helvetica').text('Sistema de Gestión', { align: 'center' });
doc.moveDown(0.3);
doc.fontSize(12).font('Helvetica').text('Manual de Usuario', { align: 'center' });
doc.moveDown(3);

doc.fontSize(11).font('Helvetica').text('Versión 1.0', { align: 'center' });
doc.fontSize(10).font('Helvetica').text(`Generado: ${new Date().toLocaleDateString('es-PY')}`, { align: 'center' });

// Nueva página para índice
doc.addPage();
doc.fontSize(18).font('Helvetica-Bold').text('Índice', { underline: true });
doc.moveDown(1);

const index = [
  '1. Introducción al Sistema',
  '2. Inicio de Sesión',
  '3. Panel Principal (Dashboard)',
  '4. Caja del Día',
  '5. Gestión de Servicios',
  '6. Registro de Gastos',
  '7. Historial de Movimientos',
  '8. Generación de Reportes',
  '9. Preguntas Frecuentes',
];

index.forEach(item => {
  doc.fontSize(12).font('Helvetica').text(item);
  doc.moveDown(0.4);
});

// SECCIÓN 1: INTRODUCCIÓN
doc.addPage();
addSection('1. Introducción al Sistema', [
  { type: 'text', text: 'Barbería Roman es un sistema de gestión integral diseñado para administrar eficientemente todas las operaciones de su peluquería. Desde el registro de clientes y servicios hasta la generación de reportes financieros, este sistema centraliza la información para una mejor toma de decisiones.' },
  { type: 'space' },
  { type: 'heading', text: 'Características Principales:' },
  { type: 'bullet', text: 'Gestión de caja diaria con apertura y cierre' },
  { type: 'bullet', text: 'Registro de servicios ofrecidos' },
  { type: 'bullet', text: 'Control detallado de gastos por categoría' },
  { type: 'bullet', text: 'Historial completo de movimientos' },
  { type: 'bullet', text: 'Reportes en PDF y Excel con análisis comparativos' },
  { type: 'bullet', text: 'Autenticación segura' },
  { type: 'bullet', text: 'Interfaz responsiva (desktop y móvil)' },
]);

// SECCIÓN 2: INICIO DE SESIÓN
doc.addPage();
addSection('2. Inicio de Sesión', [
  { type: 'text', text: 'Para acceder al sistema, ingrese a la URL de la aplicación y verá la pantalla de login.' },
  { type: 'space' },
  { type: 'heading', text: 'Pasos:' },
  { type: 'bullet', text: 'Ingrese su correo electrónico registrado' },
  { type: 'bullet', text: 'Ingrese su contraseña' },
  { type: 'bullet', text: 'Haga clic en "Iniciar sesión"' },
  { type: 'bullet', text: 'Será redirigido al panel principal' },
  { type: 'space' },
  { type: 'heading', text: 'Nota de Seguridad:' },
  { type: 'bullet', text: 'Nunca comparta sus credenciales con terceros' },
  { type: 'bullet', text: 'Cierre sesión siempre que termine de trabajar' },
  { type: 'bullet', text: 'Use contraseñas seguras y únicas' },
]);

// SECCIÓN 3: PANEL PRINCIPAL
doc.addPage();
addSection('3. Panel Principal (Dashboard)', [
  { type: 'text', text: 'El panel principal ofrece una vista resumida de toda la información importante de su negocio, permitiéndole tomar decisiones rápidas y basadas en datos actuales.' },
  { type: 'space' },
  { type: 'heading', text: 'Información Mostrada:' },
  { type: 'bullet', text: 'Total de ingresos del mes actual' },
  { type: 'bullet', text: 'Total de gastos del mes actual' },
  { type: 'bullet', text: 'Ganancia neta (ingresos - gastos)' },
  { type: 'bullet', text: 'Cantidad de clientes atendidos' },
  { type: 'bullet', text: 'Gráfico comparativo de los últimos 12 meses' },
  { type: 'bullet', text: 'Estado actual de la caja' },
  { type: 'space' },
  { type: 'text', text: 'Use esta sección para monitorear la salud financiera de su negocio de un vistazo.' },
]);

// SECCIÓN 4: CAJA DEL DÍA
doc.addPage();
addSection('4. Caja del Día', [
  { type: 'text', text: 'En esta sección puede administrar la caja diaria: abrir caja al inicio del día, registrar servicios prestados, ver el resumen del día y cerrar caja al finalizar.' },
  { type: 'space' },
  { type: 'heading', text: 'Funcionalidades:' },
  { type: 'bullet', text: 'Abrir caja: Ingrese el monto inicial al comenzar el día' },
  { type: 'bullet', text: 'Registrar servicios: Seleccione un servicio del catálogo, ingrese el precio y confirme' },
  { type: 'bullet', text: 'Ver resumen: Observe todos los servicios registrados en el día' },
  { type: 'bullet', text: 'Eliminar registros: Borre servicios si fue un error' },
  { type: 'bullet', text: 'Cerrar caja: Finalice el día y vea el total recaudado' },
  { type: 'space' },
  { type: 'text', text: 'Nota: Solo puede haber una caja abierta por día. Si cierra la caja, deberá abrir una nueva al día siguiente.' },
]);

// SECCIÓN 5: SERVICIOS
doc.addPage();
addSection('5. Gestión de Servicios', [
  { type: 'text', text: 'Aquí administra el catálogo de servicios que ofrece su barbería. Puede crear, editar y desactivar servicios según sea necesario.' },
  { type: 'space' },
  { type: 'heading', text: 'Opciones:' },
  { type: 'bullet', text: 'Crear nuevo: Ingrese nombre del servicio y precio' },
  { type: 'bullet', text: 'Editar: Modifique nombre o precio de un servicio existente' },
  { type: 'bullet', text: 'Desactivar: Retire un servicio del catálogo sin eliminar el historial' },
  { type: 'bullet', text: 'Activar: Reintegre un servicio desactivado' },
  { type: 'space' },
  { type: 'text', text: 'Los servicios desactivados no aparecerán en la caja del día, pero sus registros históricos se conservan para reportes.' },
]);

// SECCIÓN 6: GASTOS
doc.addPage();
addSection('6. Registro de Gastos', [
  { type: 'text', text: 'Registre todos los gastos operativos de su barbería. El sistema categoriza automáticamente los gastos para facilitar el análisis.' },
  { type: 'space' },
  { type: 'heading', text: 'Categorías de Gastos:' },
  { type: 'bullet', text: 'Productos: Compras de materiales (champús, tinturas, etc.)' },
  { type: 'bullet', text: 'Agua: Servicios de agua' },
  { type: 'bullet', text: 'Salarios: Pagos a empleados' },
  { type: 'bullet', text: 'Otros: Gastos misceláneos' },
  { type: 'space' },
  { type: 'heading', text: 'Cómo registrar:' },
  { type: 'bullet', text: '1. Haga clic en "Nuevo gasto"' },
  { type: 'bullet', text: '2. Seleccione la fecha del gasto' },
  { type: 'bullet', text: '3. Elija la categoría apropiada' },
  { type: 'bullet', text: '4. Ingrese descripción y monto' },
  { type: 'bullet', text: '5. Confirme guardando el gasto' },
  { type: 'space' },
  { type: 'text', text: 'Se muestra un gráfico por categoría para visualizar dónde va la mayor parte de sus gastos.' },
]);

// SECCIÓN 7: HISTORIAL
doc.addPage();
addSection('7. Historial de Movimientos', [
  { type: 'text', text: 'Vista completa de todos los ingresos y gastos registrados en el sistema. Permite búsqueda, filtrado y descarga.' },
  { type: 'space' },
  { type: 'heading', text: 'Filtros Disponibles:' },
  { type: 'bullet', text: 'Búsqueda por palabras clave' },
  { type: 'bullet', text: 'Filtro por tipo (ingreso/gasto)' },
  { type: 'bullet', text: 'Filtro por categoría' },
  { type: 'bullet', text: 'Filtro por rango de fechas' },
  { type: 'space' },
  { type: 'heading', text: 'Opciones:' },
  { type: 'bullet', text: 'Ver detalles completos de cada movimiento' },
  { type: 'bullet', text: 'Exportar a Excel para análisis adicional' },
  { type: 'bullet', text: 'Descargar en formato imprimible' },
]);

// SECCIÓN 8: REPORTES
doc.addPage();
addSection('8. Generación de Reportes', [
  { type: 'text', text: 'Genere reportes detallados para análisis financiero. El sistema permite seleccionar períodos personalizados.' },
  { type: 'space' },
  { type: 'heading', text: 'Tipos de Reportes:' },
  { type: 'bullet', text: 'PDF: Documento formateado para imprimir o compartir' },
  { type: 'bullet', text: 'Excel: Hojas de cálculo con múltiples vistas (Movimientos, Ingresos, Gastos)' },
  { type: 'space' },
  { type: 'heading', text: 'Información Incluida:' },
  { type: 'bullet', text: 'Total de ingresos y gastos del período' },
  { type: 'bullet', text: 'Ganancia neta' },
  { type: 'bullet', text: 'Cantidad de clientes atendidos' },
  { type: 'bullet', text: 'Desglose por categoría' },
  { type: 'bullet', text: 'Gráfico comparativo mensual' },
  { type: 'space' },
  { type: 'heading', text: 'Cómo Generar:' },
  { type: 'bullet', text: '1. Seleccione fecha "Desde" y "Hasta"' },
  { type: 'bullet', text: '2. Use botones de rango rápido si lo prefiere' },
  { type: 'bullet', text: '3. Haga clic en "Generar reporte"' },
  { type: 'bullet', text: '4. Elija formato (PDF o Excel)' },
  { type: 'bullet', text: '5. Se descargará automáticamente' },
]);

// SECCIÓN 9: DIFERENCIA ENTRE REPORTES E HISTORIAL
doc.addPage();
addSection('9. Diferencia entre Reportes e Historial', [
  { type: 'text', text: 'Aunque ambas secciones muestran información sobre movimientos, tienen propósitos y funcionalidades distintas. Aquí se detalla la diferencia:' },
  { type: 'space' },
  
  { type: 'heading', text: 'HISTORIAL DE MOVIMIENTOS' },
  { type: 'bullet', text: 'Función: Ver el registro detallado de cada transacción individual' },
  { type: 'bullet', text: 'Alcance: Muestra todos los gastos e ingresos sin análisis' },
  { type: 'bullet', text: 'Filtrado: Búsqueda libre, filtros por tipo y categoría' },
  { type: 'bullet', text: 'Formato: Tabla interactiva en la web' },
  { type: 'bullet', text: 'Exportación: Excel simple (lista de datos)' },
  { type: 'bullet', text: 'Uso: Consultar detalles específicos, auditoría de transacciones' },
  { type: 'bullet', text: 'Actualización: Tiempo real, se actualiza al instante' },
  
  { type: 'space' },
  { type: 'space' },
  
  { type: 'heading', text: 'REPORTES' },
  { type: 'bullet', text: 'Función: Generar resúmenes financieros consolidados para análisis' },
  { type: 'bullet', text: 'Alcance: Analiza datos en períodos específicos con totales y ganancias' },
  { type: 'bullet', text: 'Filtrado: Selecciona rango de fechas (semana, mes, año, personalizado)' },
  { type: 'bullet', text: 'Formato: Documentos profesionales (PDF o Excel avanzado)' },
  { type: 'bullet', text: 'Exportación: 3 hojas (Movimientos, Ingresos, Gastos) + gráficos' },
  { type: 'bullet', text: 'Uso: Presentaciones a clientes, análisis financiero, decisiones' },
  { type: 'bullet', text: 'Incluye: Gráficos comparativos mensuales, totales, ganancias neta' },
  
  { type: 'space' },
  { type: 'space' },
  
  { type: 'heading', text: 'RESUMEN COMPARATIVO' },
  { type: 'text', text: 'Historial: Para buscar transacciones específicas o auditar registros.' },
  { type: 'text', text: 'Reportes: Para entender la salud financiera y tomar decisiones de negocio.' },
  { type: 'space' },
  { type: 'text', text: 'Ejemplo de uso:' },
  { type: 'bullet', text: 'Usa Historial si necesitas verificar: "¿Qué gastos hice el 15 de mayo?"' },
  { type: 'bullet', text: 'Usa Reportes si necesitas saber: "¿Cuánto gané en mayo? ¿Dónde fue la mayor parte del dinero?"' },
]);

// SECCIÓN 10: PREGUNTAS FRECUENTES
doc.addPage();
addSection('10. Preguntas Frecuentes', [
  { type: 'heading', text: '¿Cómo recupero mi contraseña?' },
  { type: 'text', text: 'Contacte al administrador del sistema para solicitar una recuperación de contraseña.' },
  { type: 'space' },
  
  { type: 'heading', text: '¿Puedo editar gastos ya registrados?' },
  { type: 'text', text: 'Actualmente el sistema permite eliminar gastos. Si necesita modificar uno, elimínelo y cree uno nuevo con los datos correctos.' },
  { type: 'space' },
  
  { type: 'heading', text: '¿Qué pasa si cierro la caja sin querer?' },
  { type: 'text', text: 'Deberá crear una nueva caja para el día siguiente. Los datos del día anterior se conservan en el historial.' },
  { type: 'space' },
  
  { type: 'heading', text: '¿Puedo descargar el Excel con un formato especial?' },
  { type: 'text', text: 'El Excel se genera con formato estándar. Puede editarlo en Microsoft Excel o Calc según sus necesidades.' },
  { type: 'space' },
  
  { type: 'heading', text: '¿El sistema realiza copias de seguridad?' },
  { type: 'text', text: 'Sí, todos los datos se respaldan automáticamente en la nube. No pierde información si la página se actualiza.' },
]);

// PIE DE PÁGINA FINAL
doc.addPage();
doc.fontSize(16).font('Helvetica-Bold').text('Soporte y Contacto', { align: 'center', underline: true });
doc.moveDown(1.5);

doc.fontSize(12).font('Helvetica').text('Para consultas técnicas o soporte:', { align: 'center' });
doc.moveDown(1);

doc.fontSize(11).font('Helvetica').text('Email: soporte@barberia-roman.com', { align: 'center' });
doc.moveDown(0.5);
doc.fontSize(11).font('Helvetica').text('Teléfono: +595 (3XX) XXX-XXXX', { align: 'center' });
doc.moveDown(2);

doc.fontSize(10).font('Helvetica').text('© 2026 Barbería Roman. Todos los derechos reservados.', { align: 'center' });
doc.fontSize(9).font('Helvetica').text(`Documento generado el ${new Date().toLocaleDateString('es-PY')} a las ${new Date().toLocaleTimeString('es-PY')}`, { align: 'center' });

doc.end();

stream.on('finish', () => {
  console.log(`✓ PDF generado exitosamente: ${outputPath}`);
  console.log(`Tamaño: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
});

stream.on('error', (err) => {
  console.error('Error al generar PDF:', err);
});
