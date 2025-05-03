const handlebars = require('handlebars');
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

class HandleBarConverter {
    constructor() {
        this.templates = new Map();
    }

    async initialize() {
        this.browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
    }

    async registerTemplate(name, templateString) {
        try {
            const template = handlebars.compile(templateString);
            this.templates.set(name, template);
            return true;
        } catch (error) {
            throw new Error(`Failed to register template: ${error.message}`);
        }
    }

    async generatePDF(templateName, data, options = {}) {
        if (!this.browser) await this.initialize();
        if (!this.templates.has(templateName)) {
            throw new Error(`Template ${templateName} not found`);
        }

        const template = this.templates.get(templateName);
        const html = template(data);

        const page = await this.browser.newPage();
        try {
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
                ...options
            });
            return pdf;
        } finally {
            await page.close();
        }
    }

    async generateThumbnail(templateName, data, options = {}) {
        if (!this.browser) await this.initialize();
        if (!this.templates.has(templateName)) {
            throw new Error(`Template ${templateName} not found`);
        }

        const template = this.templates.get(templateName);
        const html = template(data);

        const page = await this.browser.newPage();
        try {
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const screenshot = await page.screenshot({
                type: 'png',
                fullPage: false,
                omitBackground: false,
                ...options
            });
            return screenshot;
        } finally {
            await page.close();
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    registerHelpers() {
        handlebars.registerHelper('formatDate', function(date) {
            return new Date(date).toLocaleDateString();
        });

        handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        });

        handlebars.registerHelper('concat', function(...args) {
            args.pop(); // Remove the last argument (Handlebars options)
            return args.join('');
        });
    }
}

module.exports = HandleBarConverter;
