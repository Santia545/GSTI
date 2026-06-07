import puppeteer from "puppeteer";

const generatePdf = async (htmlContent, outputPath = null) => {
    const browser = await puppeteer.launch( {executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox', '--disable-setuid-sandbox'], ignoreDefaultArgs: ['--disable-extensions'] });
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "load" });

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        path: outputPath || undefined, // Save to file if outputPath is provided
    });

    await browser.close();
    return pdfBuffer;
};

export { generatePdf };
