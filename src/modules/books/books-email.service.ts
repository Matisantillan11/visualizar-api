import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../../shared/providers/email.service';

/**
 * Service for sending book-related emails
 */
@Injectable()
export class BooksEmailService {
  private readonly logger = new Logger(BooksEmailService.name);

  constructor(private readonly emailService: EmailService) {}

  /**
   * Send notification to all admins when a new book request is created
   */
  async sendBookRequestNotificationToAdmins(
    adminEmails: string[],
    bookRequestData: {
      id: string;
      title: string;
      authorName: string;
      teacherName: string;
      teacherEmail: string;
      courses: Array<{ name: string }>;
      comments?: string;
      animations?: string;
      createdAt: Date;
    },
  ): Promise<void> {
    if (!adminEmails || adminEmails.length === 0) {
      this.logger.warn(
        'No admin emails found to send book request notification',
      );
      return;
    }

    const coursesList = bookRequestData.courses
      .map((course) => `<li>${course.name}</li>`)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 650px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .header .icon {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .content {
              padding: 30px;
              color: #333;
            }
            .content h2 {
              color: #667eea;
              margin-top: 0;
              font-size: 20px;
            }
            .info-section {
              background-color: #f8f9fa;
              border-left: 4px solid #667eea;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-row {
              margin: 12px 0;
              display: flex;
              align-items: flex-start;
            }
            .info-label {
              font-weight: 600;
              color: #495057;
              min-width: 140px;
              flex-shrink: 0;
            }
            .info-value {
              color: #212529;
              flex-grow: 1;
            }
            .courses-list {
              margin: 10px 0;
              padding-left: 20px;
            }
            .courses-list li {
              margin: 5px 0;
              color: #495057;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              transition: transform 0.2s;
            }
            .button:hover {
              transform: translateY(-2px);
            }
            .alert {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #856404;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 13px;
              color: #6c757d;
            }
            .divider {
              height: 1px;
              background-color: #e9ecef;
              margin: 25px 0;
            }
            .badge {
              display: inline-block;
              background-color: #667eea;
              color: white;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              margin-left: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">📚</div>
              <h1>Nueva solicitud de libro</h1>
            </div>
            
            <div class="content">
              <h2>Acción requerida</h2>
              <p>Un docente ha enviado una nueva solicitud de libro que requiere su revisión y aprobación.</p>

              <div class="info-section">
                <div class="info-row">
                  <span class="info-label">Título del libro:</span>
                  <span class="info-value"><strong>${bookRequestData.title}</strong></span>
                </div>
                <div class="info-row">
                  <span class="info-label">Autor:</span>
                  <span class="info-value">${bookRequestData.authorName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Solicitado por:</span>
                  <span class="info-value">${bookRequestData.teacherName} (${bookRequestData.teacherEmail})</span>
                </div>
                <div class="info-row">
                  <span class="info-label">ID de la solicitud:</span>
                  <span class="info-value"><code>${bookRequestData.id}</code></span>
                </div>
                <div class="info-row">
                  <span class="info-label">Enviada:</span>
                  <span class="info-value">${new Date(
                    bookRequestData.createdAt,
                  ).toLocaleString('en-US', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}</span>
                </div>
              </div>

              <div class="divider"></div>

              <h3 style="color: #495057; font-size: 16px; margin-bottom: 10px;">📖 Cursos</h3>
              <ul class="courses-list">
                ${coursesList}
              </ul>

              ${
                bookRequestData.animations
                  ? `
              <div class="divider"></div>
              <h3 style="color: #495057; font-size: 16px; margin-bottom: 10px;">🎬 Animaciones solicitadas</h3>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px;">
                <p style="margin: 0; color: #495057; white-space: pre-wrap;">${bookRequestData.animations}</p>
              </div>
              `
                  : ''
              }

              ${
                bookRequestData.comments
                  ? `
              <div class="divider"></div>
              <h3 style="color: #495057; font-size: 16px; margin-bottom: 10px;">💬 Comentarios adicionales</h3>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px;">
                <p style="margin: 0; color: #495057; white-space: pre-wrap;">${bookRequestData.comments}</p>
              </div>
              `
                  : ''
              }

              <div class="alert">
                <strong>⏰ Acción requerida:</strong> Por favor, revise esta solicitud y actualice su estado (Aprobar/Denegar) en el panel de administración.
              </div>
            </div>

            <div class="footer">
              <p><strong>Panel de administración de Visualizar</strong></p>
              <p>Esta es una notificación automática. Por favor, no responda a este correo.</p>
              <p style="margin-top: 15px; font-size: 12px;">
                © ${new Date().getFullYear()} Visualizar. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Nueva solicitud de libro

Un docente ha enviado una nueva solicitud de libro que requiere su revisión y aprobación.

DETALLES DEL LIBRO:
--------------
Título: ${bookRequestData.title}
Autor: ${bookRequestData.authorName}
Solicitado por: ${bookRequestData.teacherName} (${bookRequestData.teacherEmail})
ID de la solicitud: ${bookRequestData.id}
Enviada: ${new Date(bookRequestData.createdAt).toLocaleString()}

CURSOS:
--------
${bookRequestData.courses.map((course) => `- ${course.name}`).join('\n')}

${bookRequestData.animations ? `ANIMACIONES SOLICITADAS:\n--------------------\n${bookRequestData.animations}\n` : ''}
${bookRequestData.comments ? `COMENTARIOS ADICIONALES:\n-------------------\n${bookRequestData.comments}\n` : ''}

ACCION REQUERIDA:
Por favor, revise esta solicitud y actualice su estado (Aprobar/Denegar) en el panel de administración.

Review at: https://visualizar.com/admin/book-requests/

---
Panel de administración de Visualizar
Esta es una notificación automática. Por favor, no responda a este correo.
© ${new Date().getFullYear()} Visualizar. Todos los derechos reservados.
    `;

    try {
      await this.emailService.sendEmail({
        to: adminEmails,
        subject: `📚 Nueva solicitud de libro: "${bookRequestData.title}" - Acción requerida`,
        html,
        text,
      });

      this.logger.log(
        `Book request notification sent to ${adminEmails.length} admin(s) for request ${bookRequestData.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send book request notification to admins: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Don't throw - we don't want email failures to break the book request creation
    }
  }

  /**
   * Send confirmation email to the teacher who created the book request
   */
  async sendBookRequestConfirmationToTeacher(
    teacherEmail: string,
    teacherName: string,
    bookRequestData: {
      id: string;
      title: string;
      authorName: string;
      courses: Array<{ name: string }>;
      createdAt: Date;
    },
  ): Promise<void> {
    const coursesList = bookRequestData.courses
      .map((course) => `<li>${course.name}</li>`)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 650px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .header .icon {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .content {
              padding: 30px;
              color: #333;
            }
            .content h2 {
              color: #667eea;
              margin-top: 0;
              font-size: 20px;
            }
            .info-section {
              background-color: #f8f9fa;
              border-left: 4px solid #667eea;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-row {
              margin: 12px 0;
              display: flex;
              align-items: flex-start;
            }
            .info-label {
              font-weight: 600;
              color: #495057;
              min-width: 140px;
              flex-shrink: 0;
            }
            .info-value {
              color: #212529;
              flex-grow: 1;
            }
            .courses-list {
              margin: 10px 0;
              padding-left: 20px;
            }
            .courses-list li {
              margin: 5px 0;
              color: #495057;
            }
            .success-box {
              background-color: #d4edda;
              border-left: 4px solid #28a745;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #155724;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 13px;
              color: #6c757d;
            }
            .divider {
              height: 1px;
              background-color: #e9ecef;
              margin: 25px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">📚</div>
              <h1>Solicitud de libro envidada correctamente</h1>
            </div>
            
            <div class="content">
              <h2>Gracias, ${teacherName}!</h2>
              <p>Tu solicitud de libro ha sido enviada exitosamente y está pendiente de revisión por los administradores.</p>

              <div class="info-section">
                <div class="info-row">
                  <span class="info-label">Título del libro:</span>
                  <span class="info-value"><strong>${bookRequestData.title}</strong></span>
                </div>
                <div class="info-row">
                  <span class="info-label">Autor:</span>
                  <span class="info-value">${bookRequestData.authorName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">ID de la solicitud:</span>
                  <span class="info-value"><code>${bookRequestData.id}</code></span>
                </div>
                <div class="info-row">
                  <span class="info-label">Enviada:</span>
                  <span class="info-value">${new Date(
                    bookRequestData.createdAt,
                  ).toLocaleString('en-US', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}</span>
                </div>
              </div>

              <div class="divider"></div>

              <h3 style="color: #495057; font-size: 16px; margin-bottom: 10px;">📖 Courses</h3>
              <ul class="courses-list">
                ${coursesList}
              </ul>

              <div class="divider"></div>

              <div class="success-box">
                <strong>✅ Qué sigue?</strong><br/>
                Tu solicitud ahora está en revisión. Serás notificado por correo electrónico una vez que un administrador revise y actualice el estado de tu solicitud.
              </div>

              <p style="color: #495057; font-size: 14px;">
                Puedes verificar el estado de tu solicitud en la plataforma dentro de la sección "Mis solicitudes".
              </p>
            </div>

            <div class="footer">
              <p><strong>Visualizar</strong></p>
              <p>Este es un correo electrónico automático de confirmación. Por favor, no responda a este correo.</p>
              <p style="margin-top: 15px; font-size: 12px;">
                © ${new Date().getFullYear()} Visualizar. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Hola ${teacherName},

Tu solicitud de libro ha sido enviada exitosamente y está pendiente de revisión por los administradores.

Título del libro: ${bookRequestData.title}
Autor: ${bookRequestData.authorName}
ID de la solicitud: ${bookRequestData.id}
Cursos:
${bookRequestData.courses.map((course) => `- ${course.name}`).join('\n')}

Serás notificado una vez que tu solicitud haya sido revisada.
Puedes verificar el estado de tu solicitud en la plataforma dentro de la sección "Mis solicitudes".

© ${new Date().getFullYear()} Visualizar. Todos los derechos reservados.
    `;

    try {
      await this.emailService.sendEmail({
        to: teacherEmail,
        subject: `✅ Solicitud de libro enviada: "${bookRequestData.title}"`,
        html,
        text,
      });

      this.logger.log(
        `Book request confirmation sent to teacher ${teacherEmail} for request ${bookRequestData.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send book request confirmation to teacher: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Don't throw - we don't want email failures to break the book request creation
    }
  }

  /**
   * Send notification to the teacher when their book has been published
   */
  async sendBookPublishedNotificationToTeacher(
    teacherEmail: string,
    teacherName: string,
    bookData: {
      id: string;
      title: string;
      authorName: string;
      courses: Array<{ name: string }>;
      publishedAt: Date;
    },
  ): Promise<void> {
    const coursesList = bookData.courses
      .map((course) => `<li>${course.name}</li>`)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 650px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .header .icon {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .content {
              padding: 30px;
              color: #333;
            }
            .content h2 {
              color: #28a745;
              margin-top: 0;
              font-size: 20px;
            }
            .info-section {
              background-color: #f8f9fa;
              border-left: 4px solid #28a745;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-row {
              margin: 12px 0;
              display: flex;
              align-items: flex-start;
            }
            .info-label {
              font-weight: 600;
              color: #495057;
              min-width: 140px;
              flex-shrink: 0;
            }
            .info-value {
              color: #212529;
              flex-grow: 1;
            }
            .courses-list {
              margin: 10px 0;
              padding-left: 20px;
            }
            .courses-list li {
              margin: 5px 0;
              color: #495057;
            }
            .success-box {
              background-color: #d4edda;
              border-left: 4px solid #28a745;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #155724;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 13px;
              color: #6c757d;
            }
            .divider {
              height: 1px;
              background-color: #e9ecef;
              margin: 25px 0;
            }
            .celebration {
              font-size: 32px;
              text-align: center;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">📚</div>
              <h1>¡Tu libro ha sido publicado!</h1>
            </div>
            
            <div class="content">
              <div class="celebration">🎉 🎊 🎉</div>
              <h2>¡Felicitaciones, ${teacherName}!</h2>
              <p>Nos complace informarte que tu solicitud de libro ha sido procesada y el libro ya está disponible en la plataforma para tus estudiantes.</p>

              <div class="info-section">
                <div class="info-row">
                  <span class="info-label">Título del libro:</span>
                  <span class="info-value"><strong>${bookData.title}</strong></span>
                </div>
                <div class="info-row">
                  <span class="info-label">Autor:</span>
                  <span class="info-value">${bookData.authorName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Publicado:</span>
                  <span class="info-value">${new Date(
                    bookData.publishedAt,
                  ).toLocaleString('es-ES', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}</span>
                </div>
              </div>

              <div class="divider"></div>

              <h3 style="color: #495057; font-size: 16px; margin-bottom: 10px;">📖 Disponible en los cursos</h3>
              <ul class="courses-list">
                ${coursesList}
              </ul>

              <div class="divider"></div>

              <div class="success-box">
                <strong>✅ ¿Qué sigue?</strong><br/>
                El libro ya está disponible para tus estudiantes. Puedes acceder a él desde la sección de "Libros" en la plataforma.
              </div>

              <p style="color: #495057; font-size: 14px;">
                Gracias por enriquecer el contenido educativo de nuestra plataforma. Si tienes alguna pregunta o necesitas realizar cambios, no dudes en contactarnos.
              </p>
            </div>

            <div class="footer">
              <p><strong>Visualizar</strong></p>
              <p>Este es un correo electrónico automático de notificación. Por favor, no responda a este correo.</p>
              <p style="margin-top: 15px; font-size: 12px;">
                © ${new Date().getFullYear()} Visualizar. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
¡Tu libro ha sido publicado!

¡Felicitaciones, ${teacherName}!

Nos complace informarte que tu solicitud de libro ha sido procesada y el libro ya está disponible en la plataforma para tus estudiantes.

Título del libro: ${bookData.title}
Autor: ${bookData.authorName}
Publicado: ${new Date(bookData.publishedAt).toLocaleString()}

Disponible en los cursos:
${bookData.courses.map((course) => `- ${course.name}`).join('\n')}

El libro ya está disponible para tus estudiantes. Puedes acceder a él desde la sección de "Libros" en la plataforma.

Gracias por enriquecer el contenido educativo de nuestra plataforma.

© ${new Date().getFullYear()} Visualizar. Todos los derechos reservados.
    `;

    try {
      await this.emailService.sendEmail({
        to: teacherEmail,
        subject: `🎉 ¡Tu libro "${bookData.title}" ha sido publicado!`,
        html,
        text,
      });

      this.logger.log(
        `Book published notification sent to teacher ${teacherEmail} for book ${bookData.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send book published notification to teacher: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Don't throw - we don't want email failures to break the process
    }
  }
}
