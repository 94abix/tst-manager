/**
 * Contrôleur de génération PDF
 * PDF Generation Controller
 *
 * @module controllers/pdfController
 * @author Renault Group - Service 00596
 */

const { TSTForm } = require('../models/TSTForm');
const { AuditLog, AUDIT_ACTIONS } = require('../models/AuditLog');
const pdfGenerator = require('../services/pdfGenerator');

/**
 * Génère et télécharge le PDF d'une fiche TST
 * Generate and download PDF of a TST form
 *
 * GET /api/tst/:id/pdf
 */
async function generatePDF(req, res) {
  try {
    const { id } = req.params;

    // Récupérer la fiche avec toutes les données jointes / Get form with all joined data
    const form = TSTForm.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Fiche TST non trouvée'
      });
    }

    // Générer le PDF / Generate PDF
    const pdfBuffer = await pdfGenerator.generateTSTForm(form);

    // Log l'export / Log export
    AuditLog.create({
      tst_form_id: form.id,
      user_id: req.user.id,
      action: AUDIT_ACTIONS.EXPORT_PDF,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    // Nom du fichier / File name
    const fileName = `${form.reference_tst}.pdf`;

    // Envoyer le PDF / Send PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

  } catch (error) {
    console.error('[PDF] Erreur generatePDF:', error);
    res.status(500).json({
      success: false,
      error: 'PDF_GENERATION_ERROR',
      message: 'Erreur lors de la génération du PDF'
    });
  }
}

/**
 * Prévisualise le PDF d'une fiche TST (affichage inline)
 * Preview PDF of a TST form (inline display)
 *
 * GET /api/tst/:id/pdf/preview
 */
async function previewPDF(req, res) {
  try {
    const { id } = req.params;

    const form = TSTForm.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Fiche TST non trouvée'
      });
    }

    // Générer le PDF / Generate PDF
    const pdfBuffer = await pdfGenerator.generateTSTForm(form);

    // Affichage inline (pas de téléchargement) / Inline display (no download)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${form.reference_tst}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

  } catch (error) {
    console.error('[PDF] Erreur previewPDF:', error);
    res.status(500).json({
      success: false,
      error: 'PDF_GENERATION_ERROR',
      message: 'Erreur lors de la génération du PDF'
    });
  }
}

module.exports = {
  generatePDF,
  previewPDF
};
