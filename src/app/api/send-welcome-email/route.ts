import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, nome } = await request.json();

    if (!email || !nome) {
      return NextResponse.json(
        { error: 'Email e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Enviar email de boas-vindas
    const { data, error } = await resend.emails.send({
      from: 'Trompete <onboarding@resend.dev>', // Substitua pelo seu domínio verificado
      to: [email],
      subject: '🎺 Bem-vindo à maior benção da sua vida!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
              }
              .highlight {
                background: #fef3c7;
                padding: 15px;
                border-left: 4px solid #f59e0b;
                margin: 20px 0;
              }
              .benefits {
                list-style: none;
                padding: 0;
              }
              .benefits li {
                padding: 10px 0;
                padding-left: 30px;
                position: relative;
              }
              .benefits li:before {
                content: "✓";
                position: absolute;
                left: 0;
                color: #10b981;
                font-weight: bold;
                font-size: 20px;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 32px;">🎺 Trompete</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Sua jornada de fé começa agora!</p>
            </div>
            
            <div class="content">
              <h2 style="color: #f59e0b;">Olá, ${nome}! 👋</h2>
              
              <p style="font-size: 18px; font-weight: bold; color: #059669;">
                Parabéns! Você está cadastrado(a) na maior benção da sua vida! ✨
              </p>
              
              <p>
                Bem-vindo(a) ao <strong>Trompete</strong>, seu aplicativo de mensagens diárias de fé e inspiração.
              </p>
              
              <div class="highlight">
                <p style="margin: 0; font-weight: bold;">🎁 Você ganhou 3 dias de teste grátis!</p>
              </div>
              
              <p>Durante seu período de teste, você terá acesso completo a:</p>
              
              <ul class="benefits">
                <li>Mensagens diárias personalizadas de acordo com sua fé</li>
                <li>Orações especiais para momentos importantes</li>
                <li>Salvar seus versículos favoritos</li>
                <li>Notificações diárias de inspiração</li>
                <li>E muito mais!</li>
              </ul>
              
              <p style="margin-top: 30px;">
                Que Deus abençoe sua jornada conosco! 🙏
              </p>
              
              <p style="margin-top: 20px; font-style: italic; color: #6b7280;">
                Com carinho,<br>
                <strong>Equipe Trompete</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>Você está recebendo este email porque se cadastrou no Trompete.</p>
              <p>© 2024 Trompete. Todos os direitos reservados.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Erro ao enviar email:', error);
      return NextResponse.json(
        { error: 'Erro ao enviar email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro inesperado ao enviar email' },
      { status: 500 }
    );
  }
}
