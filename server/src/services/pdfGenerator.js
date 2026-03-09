/**
 * Service de génération PDF
 * PDF Generation Service - Génère les fiches TST au format PDF
 *
 * @module services/pdfGenerator
 * @author Renault Group - Service 00596
 */

const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');

// Couleurs Renault / Renault colors
const COLORS = {
  PRIMARY: '#FFCC00',      // Jaune Renault / Renault Yellow
  SECONDARY: '#000000',    // Noir / Black
  GRAY: '#666666',
  LIGHT_GRAY: '#CCCCCC',
  WHITE: '#FFFFFF',
  DANGER: '#DC3545'
};

/**
 * Génère le PDF d'une fiche TST
 * Generate TST form PDF
 *
 * @param {Object} form - Données de la fiche TST
 * @returns {Promise<Buffer>} Buffer du PDF
 */
async function generateTSTForm(form) {
  return new Promise((resolve, reject) => {
    try {
      const chunks = [];
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 40, right: 40 }
      });

      // Collecter les chunks / Collect chunks
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // === EN-TÊTE / HEADER ===
      drawHeader(doc, form);

      // === SECTION 1: ORDRE ET AUTORISATION ===
      drawOrderSection(doc, form);

      // === SECTION 2: AVIS DE DÉBUT DE TRAVAIL ===
      drawStartWorkSection(doc, form);

      // === SECTION 3: AVIS DE FIN DE TRAVAIL ===
      drawEndWorkSection(doc, form);

      // === PIED DE PAGE / FOOTER ===
      drawFooter(doc, form);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Dessine l'en-tête du document
 * Draw document header
 */
function drawHeader(doc, form) {
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // Bandeau jaune / Yellow banner
  doc.rect(40, 40, pageWidth, 60)
     .fill(COLORS.PRIMARY);

  // Titre principal / Main title
  doc.fillColor(COLORS.SECONDARY)
     .fontSize(14)
     .font('Helvetica-Bold')
     .text('RÉPARATION BATTERIE DE TRACTION', 50, 55, { align: 'center', width: pageWidth - 20 });

  doc.fontSize(18)
     .text('TRAVAIL SOUS TENSION', 50, 75, { align: 'center', width: pageWidth - 20 });

  // Référence et statut / Reference and status
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor(COLORS.GRAY)
     .text(`Référence: ${form.reference_tst}`, 50, 110);

  // Badge de statut / Status badge
  const statusColors = {
    'brouillon': '#6C757D',
    'en_cours': '#FFC107',
    'valide': '#28A745',
    'archive': '#17A2B8'
  };
  const statusLabels = {
    'brouillon': 'BROUILLON',
    'en_cours': 'EN COURS',
    'valide': 'VALIDÉ',
    'archive': 'ARCHIVÉ'
  };

  const statusColor = statusColors[form.statut] || COLORS.GRAY;
  const statusLabel = statusLabels[form.statut] || form.statut.toUpperCase();

  doc.rect(pageWidth - 60, 105, 80, 20)
     .fill(statusColor);

  doc.fillColor(COLORS.WHITE)
     .fontSize(9)
     .font('Helvetica-Bold')
     .text(statusLabel, pageWidth - 55, 110, { width: 70, align: 'center' });

  // Avertissement / Warning
  doc.fillColor(COLORS.SECONDARY)
     .fontSize(8)
     .font('Helvetica')
     .text(
       'Cette fiche est obligatoirement documentée à chaque fois qu\'un diagnostic ou une réparation doit être effectué sur une batterie de traction d\'un véhicule électrique ou hybride.',
       50, 135, { width: pageWidth - 20, align: 'justify' }
     );

  doc.moveDown(0.5);
}

/**
 * Dessine la section Ordre et Autorisation
 * Draw Order and Authorization section
 */
function drawOrderSection(doc, form) {
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  let y = 170;

  // Titre de section / Section title
  doc.rect(40, y, pageWidth, 25)
     .fill(COLORS.SECONDARY);

  doc.fillColor(COLORS.WHITE)
     .fontSize(11)
     .font('Helvetica-Bold')
     .text('ORDRE ET AUTORISATION DE TRAVAIL SOUS TENSION', 50, y + 7, { width: pageWidth - 20 });

  y += 35;

  // Informations générales / General information
  doc.fillColor(COLORS.SECONDARY)
     .fontSize(9)
     .font('Helvetica');

  // Date
  drawField(doc, 'Date:', formatDate(form.date_ordre), 50, y, 200);
  y += 20;

  // Type de batterie et BIN
  drawField(doc, 'Type de batterie/véhicule:', form.type_batterie || '-', 50, y, 250);
  drawField(doc, 'Identification (BIN):', form.identification_bin || '-', 320, y, 200);
  y += 25;

  // Responsable d'exploitation / Operations manager
  doc.font('Helvetica-Bold')
     .text('Responsable d\'exploitation:', 50, y);
  y += 15;

  drawPersonField(doc, form.responsable_exploitation_nom, form.responsable_exploitation_entreprise, form.responsable_exploitation_fonction, 50, y);
  y += 35;

  // Chargé de travaux / Work manager
  doc.font('Helvetica-Bold')
     .text('ordonne et autorise le chargé de travaux: B2TL', 50, y);
  y += 15;

  drawPersonField(doc, form.charge_travaux_ordre_nom, form.charge_travaux_ordre_entreprise, null, 50, y);
  y += 35;

  // Nature des travaux / Work description
  doc.font('Helvetica-Bold')
     .text('à accéder à la batterie de traction sous tension pour effectuer les travaux suivants:', 50, y);
  y += 15;

  doc.font('Helvetica')
     .text(form.nature_travaux || '-', 60, y, { width: pageWidth - 40 });
  y += Math.max(30, doc.heightOfString(form.nature_travaux || '-', { width: pageWidth - 40 }));

  // Indications complémentaires / Additional instructions
  if (form.indications_complementaires) {
    doc.font('Helvetica-Bold')
       .text('Indications complémentaires:', 50, y);
    y += 12;
    doc.font('Helvetica')
       .text(form.indications_complementaires, 60, y, { width: pageWidth - 40 });
    y += 25;
  }

  // Lieu d'intervention / Location
  drawField(doc, 'Lieu d\'intervention:', form.lieu_intervention || '-', 50, y, pageWidth - 20);
  y += 20;

  // Période d'autorisation / Authorization period
  drawField(doc, 'Autorisation valable du:', formatDateTime(form.autorisation_debut), 50, y, 230);
  drawField(doc, 'au:', formatDateTime(form.autorisation_fin), 290, y, 230);
  y += 20;

  drawField(doc, 'Avis de fin de travail au plus tard le:', formatDateTime(form.delai_fin_travail), 50, y, 400);
  y += 25;

  // Impossibilité technique / Technical impossibility
  if (form.impossibilite_technique) {
    doc.fillColor(COLORS.DANGER)
       .font('Helvetica-Bold')
       .text('Impossibilité Technique, justification:', 50, y);
    y += 12;
    doc.fillColor(COLORS.SECONDARY)
       .font('Helvetica')
       .text(form.impossibilite_technique, 60, y, { width: pageWidth - 40 });
    y += 25;
  }

  return y;
}

/**
 * Dessine la section Avis de début de travail
 * Draw Start Work section
 */
function drawStartWorkSection(doc, form) {
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  let y = doc.y + 10;

  // Vérifier si on a besoin d'une nouvelle page / Check if we need a new page
  if (y > 600) {
    doc.addPage();
    y = 50;
  }

  // Titre de section / Section title
  doc.rect(40, y, pageWidth, 25)
     .fill(COLORS.SECONDARY);

  doc.fillColor(COLORS.WHITE)
     .fontSize(11)
     .font('Helvetica-Bold')
     .text('AVIS DE DÉBUT DE TRAVAIL', 50, y + 7, { width: pageWidth - 20 });

  y += 35;

  doc.fillColor(COLORS.SECONDARY)
     .fontSize(9);

  // Date et heure de début / Start date and time
  drawField(doc, 'Date:', formatDate(form.date_debut_travail), 50, y, 200);
  drawField(doc, 'Heure:', formatTime(form.date_debut_travail), 260, y, 150);
  y += 25;

  // Chargé de travaux / Work manager
  doc.font('Helvetica-Bold')
     .text('Chargé de travaux: B2TL', 50, y);
  y += 15;
  drawPersonField(doc, form.charge_travaux_debut_nom, null, null, 50, y);
  y += 30;

  // Exécutant / Executor
  doc.font('Helvetica-Bold')
     .text('Exécutant: B1TL', 50, y);
  y += 15;
  drawPersonField(doc, form.executant_nom, null, null, 50, y);
  y += 30;

  // Surveillant de sécurité / Safety supervisor
  doc.font('Helvetica-Bold')
     .text('Surveillant de sécurité électrique:', 50, y);
  y += 15;
  drawPersonField(doc, form.surveillant_nom || 'N/A', null, null, 50, y);
  y += 30;

  return y;
}

/**
 * Dessine la section Avis de fin de travail
 * Draw End Work section
 */
function drawEndWorkSection(doc, form) {
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  let y = doc.y + 10;

  // Vérifier si on a besoin d'une nouvelle page / Check if we need a new page
  if (y > 650) {
    doc.addPage();
    y = 50;
  }

  // Titre de section / Section title
  doc.rect(40, y, pageWidth, 25)
     .fill(COLORS.SECONDARY);

  doc.fillColor(COLORS.WHITE)
     .fontSize(11)
     .font('Helvetica-Bold')
     .text('AVIS DE FIN DE TRAVAIL', 50, y + 7, { width: pageWidth - 20 });

  y += 35;

  doc.fillColor(COLORS.SECONDARY)
     .fontSize(9);

  // Date et heure de fin / End date and time
  drawField(doc, 'Date:', formatDate(form.date_fin_travail), 50, y, 200);
  drawField(doc, 'Heure:', formatTime(form.date_fin_travail), 260, y, 150);
  y += 25;

  // État de la batterie / Battery status
  doc.font('Helvetica-Bold')
     .text('État de la batterie de traction:', 50, y);
  y += 15;
  doc.font('Helvetica')
     .text(form.etat_batterie_fin || 'Non renseigné', 60, y, { width: pageWidth - 40 });
  y += 25;

  // Chargé de travaux fin / End work manager
  doc.font('Helvetica-Bold')
     .text('Chargé de travaux:', 50, y);
  y += 15;
  drawPersonField(doc, form.charge_travaux_fin_nom, null, null, 50, y);
  y += 30;

  // Responsable d'exploitation / Operations manager
  doc.font('Helvetica-Bold')
     .text('Responsable d\'exploitation:', 50, y);
  y += 15;
  drawPersonField(doc, form.responsable_fin_nom, null, null, 50, y);

  return y;
}

/**
 * Dessine le pied de page
 * Draw footer
 */
function drawFooter(doc, form) {
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const y = doc.page.height - 60;

  doc.fillColor(COLORS.LIGHT_GRAY)
     .rect(40, y, pageWidth, 1)
     .fill();

  doc.fillColor(COLORS.GRAY)
     .fontSize(8)
     .font('Helvetica')
     .text(
       'RENAULT Group - After Sales Engineering - Service 00596',
       50, y + 10,
       { width: pageWidth - 20, align: 'center' }
     );

  doc.text(
    `Document généré le ${dayjs().format('DD/MM/YYYY à HH:mm')} - ${form.reference_tst}`,
    50, y + 22,
    { width: pageWidth - 20, align: 'center' }
  );

  // Watermark si archivé / Watermark if archived
  if (form.statut === 'archive') {
    doc.save();
    doc.rotate(-45, { origin: [300, 400] });
    doc.fillColor('#CCCCCC')
       .fontSize(60)
       .font('Helvetica-Bold')
       .opacity(0.3)
       .text('ARCHIVÉ', 150, 400);
    doc.restore();
  }
}

/**
 * Dessine un champ label/valeur
 * Draw label/value field
 */
function drawField(doc, label, value, x, y, width) {
  doc.font('Helvetica-Bold')
     .fontSize(9)
     .fillColor(COLORS.SECONDARY)
     .text(label, x, y);

  const labelWidth = doc.widthOfString(label);

  doc.font('Helvetica')
     .text(value || '-', x + labelWidth + 5, y, { width: width - labelWidth - 10 });
}

/**
 * Dessine un champ personne (Nom, Entreprise, Fonction)
 * Draw person field (Name, Company, Function)
 */
function drawPersonField(doc, nom, entreprise, fonction, x, y) {
  doc.font('Helvetica')
     .fontSize(9)
     .fillColor(COLORS.SECONDARY);

  let text = `Nom/Prénom: ${nom || '________________'}`;
  if (entreprise) {
    text += `   |   Entreprise: ${entreprise}`;
  }
  if (fonction) {
    text += `   |   Fonction: ${fonction}`;
  }

  doc.text(text, x, y);

  // Zone de signature / Signature area
  doc.rect(x + 400, y - 5, 100, 25)
     .stroke(COLORS.LIGHT_GRAY);

  doc.fontSize(7)
     .fillColor(COLORS.GRAY)
     .text('Signature', x + 430, y + 12);
}

/**
 * Formate une date
 * Format date
 */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  return dayjs(dateStr).format('DD/MM/YYYY');
}

/**
 * Formate une date et heure
 * Format datetime
 */
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  return dayjs(dateStr).format('DD/MM/YYYY à HH:mm');
}

/**
 * Formate une heure
 * Format time
 */
function formatTime(dateStr) {
  if (!dateStr) return '-';
  return dayjs(dateStr).format('HH:mm');
}

module.exports = {
  generateTSTForm
};
