/**
 * Preview script for Early Access Announcement Email
 * Run with: node preview-early-access-email.js
 */

const { createEarlyAccessAnnouncementTemplate } = require('./dist/utils/emailTemplates.js');
const fs = require('fs');
const path = require('path');

// Generate the email HTML
const emailHtml = createEarlyAccessAnnouncementTemplate();

// Save to preview file
const previewPath = path.join(__dirname, 'email-previews', 'early-access-announcement.html');
fs.writeFileSync(previewPath, emailHtml);

console.log('✅ Early Access Announcement email preview generated!');
console.log(`📁 Preview saved to: ${previewPath}`);
console.log('\n📧 Email Preview:');
console.log('='.repeat(60));
console.log('Subject: Ya puedes activar tu cuenta en Kustodia');
console.log('='.repeat(60));

// Also display a text version for quick review
console.log(`
ASUNTO: Ya puedes activar tu cuenta en Kustodia

CONTENIDO:
- Saludo: Hola
- Título: 🚀 Ya puedes activar tu cuenta en Kustodia
- Subtítulo: Tu acceso anticipado está habilitado
- Mensaje principal: Gracias por creer en Kustodia...
- Botón de acción: 🔐 Registrarse Ahora → https://kustodia.mx/register
- Código de acceso destacado: kustodiapremier
- Firma: Equipo Kustodia / soporte@kustodia.mx

✨ El email incluye:
- Diseño consistente con la marca Kustodia
- Código de acceso visualmente destacado
- Botón de registro prominente
- Mensaje profesional y motivador
- Información de contacto actualizada
`);

console.log('\n🌐 To view the full HTML preview, open the generated file in your browser.');
