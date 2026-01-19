
export const sendDeckEmail = async (email: string, deckData: any, datasetName: string) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('Resend API Key no configurada.');
    return { success: false, error: 'Configuración pendiente' };
  }

  const slidesHtml = deckData.slides.map((s: any, i: number) => `
    <div style="margin-bottom: 30px; padding: 25px; border-left: 6px solid #5c56f1; background: #fafafa; border-radius: 0 15px 15px 0;">
      <h3 style="margin: 0 0 15px 0; color: #111; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Slide ${i + 1}: ${s.title}</h3>
      <ul style="color: #555; font-size: 15px; line-height: 1.6; padding-left: 20px;">
        ${s.content.map((item: string) => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  const body = {
    from: 'Jorge Roldan <roldanjorgex@gmail.com>', // Requesting specific sender
    to: [email],
    subject: `Reporte Ejecutivo de Proceso: ${datasetName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        <div style="background: #0c0c0e; padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px; text-transform: uppercase; font-style: italic;">GPS Discovery AI</h1>
          <p style="margin: 10px 0 0 0; color: #5c56f1; font-weight: bold; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Executive Insights Engine</p>
        </div>
        <div style="padding: 40px; color: #333;">
          <p style="font-size: 16px;">Hola,</p>
          <p style="font-size: 16px; margin-bottom: 30px;">Hemos completado el análisis de Process Mining para <strong>${datasetName}</strong>. A continuación, presentamos los hallazgos clave y la estrategia recomendada por nuestro motor de IA.</p>
          
          ${slidesHtml}
          
          <div style="margin-top: 40px; padding: 20px; background: #f0f0ff; border-radius: 15px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #5c56f1; font-weight: bold;">Puedes ver la visualización completa en tu panel de control.</p>
          </div>

          <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0;" />
          <p style="font-size: 11px; color: #999; text-align: center; line-height: 1.5;">
            Este es un reporte automatizado generado por GPS Discovery AI.<br/>
            © 2025 GPS Process Discovery. Todos los derechos reservados.
          </p>
        </div>
      </div>
    `
  };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errData = await response.json();
      console.error('Resend API Error:', errData);
      return { success: false, error: errData.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: 'Network error' };
  }
};
