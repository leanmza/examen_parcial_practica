// Script para generar PDF con los datos de inscripción al torneo
function generarPDF(datos) {
  // Verificar que jsPDF (UMD) esté disponible
  if (!window.jspdf || !window.jspdf.jsPDF) {
    console.error("jsPDF no está disponible");
    alert("Error: No se puede generar el PDF. jsPDF no está cargado.");
    return;
  }


  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Configuración del documento
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Título
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text("COMPROBANTE DE INSCRIPCIÓN", pageWidth / 2, 30, {
    align: "center",
  });

  // Logo (si está disponible)
  try {
    // Aquí podrías agregar un logo si lo tienes disponible
    // doc.addImage(logoData, 'PNG', margin, 10, 30, 30);
  } catch (e) {
    console.log("No se pudo cargar el logo");
  }

  // Información del torneo
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("ROL DUNGEON - TORNEO OFICIAL", margin, 50);

  doc.setFontSize(12);
  doc.setFont(undefined, "normal");
  doc.text(
    "Gracias por inscribirte a nuestro torneo. A continuación encontrarás los detalles de tu inscripción:",
    margin,
    60
  );

  // Identificador de inscripción (si fue provisto)
  doc.setFont(undefined, "bold");
  doc.text("IDENTIFICADOR:", margin, 70);
  doc.setFont(undefined, "normal");
  doc.text(`${datos.identificador || "-"}`, margin + 40, 70);

  // Datos del participante
  let yPos = 80;

  doc.setFont(undefined, "bold");
  doc.text("DATOS DEL PARTICIPANTE:", margin, yPos);
  yPos += 10;

  doc.setFont(undefined, "normal");
  doc.text(`Nombre: ${datos.nombre} ${datos.apellido}`, margin, yPos);
  yPos += 7;
  doc.text(
    `DNI: ${datos.dni}     Fecha de nacimiento: ${datos.nacimientoFecha}`,
    margin,
    yPos
  );

  yPos += 7;
  doc.text(`Teléfono: ${datos.telefono}`, margin, yPos);
  yPos += 7;
  doc.text(`Email: ${datos.email}`, margin, yPos);
  yPos += 15;

  // Detalles del torneo
  doc.setFont(undefined, "bold");
  doc.text("DETALLES DEL TORNEO:", margin, yPos);
  yPos += 10;

  doc.setFont(undefined, "normal");
  doc.text(`Sede: ${datos.sedeElegida.nombre}`, margin, yPos);
  yPos += 7;
  doc.text(`Dirección: ${datos.sedeElegida.direccion}, ${datos.sedeElegida.ciudad}`, margin, yPos);
  yPos += 7;
  doc.text(`Fecha: ${datos.fechaElegida}`, margin, yPos);
  yPos += 15;

  // Instrucciones
  doc.setFont(undefined, "bold");
  doc.text("INFORMACIÓN IMPORTANTES:", margin, yPos);
  yPos += 10;

  const instrucciones = [
    "• El horario de inicio se comunicará en nuestras redes sociales.",
    "• Presentarse 15 minutos antes del inicio del torneo.",
    "• Traer identificación oficial.",
    "• El uso de mazos preconstruidos está permitido.",
    "• Cualquier comportamiento antideportivo será sancionado.",
    "• Los resultados serán publicados en nuestra web al finalizar.",
  ];

  instrucciones.forEach((inst) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont(undefined, "normal");
    doc.text(inst, margin, yPos);
    yPos += 7;
  });

  // Pie de página
  const fechaInscripcion = new Date().toLocaleDateString("es-ES");
  doc.setFontSize(10);
  doc.text(`Fecha de inscripción: ${fechaInscripcion}`, margin, 280);
  doc.text("ROL DUNGEON - www.roldungeon.com", pageWidth - margin, 280, {
    align: "right",
  });

  // Guardar el PDF
  doc.save(`inscripcion_torneo_${datos.nombre}_${datos.apellido}.pdf`);
}
