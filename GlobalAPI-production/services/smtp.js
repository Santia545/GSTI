import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { generatePdf } from "./pdfGenerator.js";

dotenv.config();

const sendEmail = async (toEmail, content, isPaypal = false) => {
    // Generate a PDF from HTML content if needed
    let attachment = null;
    if (!isPaypal) {
        const pdfContent = `
        <html>
            <style>
                * {
                    font-family: Arial, Helvetica, sans-serif;
                }

                table {
                    width: 100%;
                    overflow: hidden;
                    text-align: left;
                    border: 1px solid #ccc;
                    border-radius: 10px;
                    padding: 10px;
                }

                table th {
                    background-color: #a7d3ff;
                    color: #000;
                    padding: 10px 10px 10px 10px;
                }

                table td {
                    padding: 3px 0px 3px 10px;
                }
            </style>
        <body style="padding: 20px">
            <h1>Resumen de la compra</h1>
            <p>${content}</p>
            <h4> Linea de captura Banorte: </h4>    
            <p> 2548 6842 3310 4070 0420 0000 1202 4412 8421 1
            <h4> Numero de la empresa: </h4>
            <p> 109931</p>
        </body>
        </html>`;
        const pdfBuffer = await generatePdf(pdfContent);
        attachment = { filename: "purchase_summary.pdf", content: pdfBuffer };
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: toEmail,
        subject: "Detalles de tu compra en MusicZone",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
            * {
                font-family: Arial, Helvetica, sans-serif;
            }

            .container {
                width: 100%;
                margin: 0 auto;
                padding: 20px;
            }

            .pb-3 {
                padding-bottom: 1rem;
            }

            .display-4 {
                font-size: 1.5rem;
                font-weight: 300;
                line-height: 1.2;
            }

            .text-center {
                text-align: center;
            }

            .blockquote {
                color: white;
                background-color: #0065ca;
                margin: 1.5rem 0;
                padding: 0.5rem 1rem;
                border-left: 0.25rem solid #eceeef;
            }

            .blockquote-footer {
                display: block;
                font-size: 80%;
                color: white;
            }

            .table-container {
                width: 100%;
                overflow-x: auto;
                max-width: 1000px;
            }

            table {
                width: 100%;
                overflow: hidden;
                text-align: left;
                border: 1px solid #ccc;
                border-radius: 10px;
                padding: 10px;
            }

            table th {
                background-color: #a7d3ff;
                color: #000;
                padding: 10px 10px 10px 10px;
            }

            table td {
                padding: 3px 0px 3px 10px;
            }
            </style>
        </head>
        <body>
            <div class="container">
            <main role="main" class="pb-3">
                <h1 class="display-4">Hola: ${toEmail}</h1>
                <div class="text-center"> Resumen de la compra: </div>
                <div>
                <div>
                    ${content}
                </div>
                </div>
                <div>
                ${isPaypal ? 
                    `<h4> Compra realizada mediante Paypal: </h4>`
                :
                    `<h4> Linea de captura Banorte: </h4>
                    <p> 2548 6842 3310 4070 0420 0000 1202 4412 8421 1
                    <h4> Numero de la empresa: </h4>
                    <p> 109931</p>`
                }
                <h4> Nombre de la empresa </h4>
                <p> MusicZone Inc.</p>
                </div>
                <blockquote class="blockquote">
                <p class="mb-15"> Si no has sido tú, te enviamos este correo porque alguien ha intentado comprar usando tu cuenta de musiczone <br> Este correo ha sido generado automáticamente, por favor no responder. Para solucionar problemas contactar con soporte en corc1809@gmail.com o marcar a 3311515231 </p>
                <footer class="blockquote-footer">Atentamente: <cite title="Source Title">El soporte de MusicZone</cite>
                </footer>
                </blockquote>
            </main>
            </div>
        </body>
        </html>`,
        attachments: attachment ? [attachment] : [],
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};
export { sendEmail };
