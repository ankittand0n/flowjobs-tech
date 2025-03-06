import { HttpService } from "@nestjs/axios";
import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import fontkit from "@pdf-lib/fontkit";
import { ResumeDto } from "@reactive-resume/dto";
import { ErrorMessage, getFontUrls } from "@reactive-resume/utils";
import retry from "async-retry";
import { PDFDocument } from "pdf-lib";
import { connect } from "puppeteer";

import { Config } from "../config/schema";
import { StorageService } from "../storage/storage.service";

@Injectable()
export class PrinterService {
  private readonly logger = new Logger(PrinterService.name);

  private readonly browserURL: string;

  private readonly ignoreHTTPSErrors: boolean;

  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly storageService: StorageService,
    private readonly httpService: HttpService,
  ) {
    const chromeUrl = this.configService.getOrThrow<string>("CHROME_URL");
    const chromeToken = this.configService.getOrThrow<string>("CHROME_TOKEN");

    this.browserURL = `${chromeUrl}?token=${chromeToken}`;
    this.ignoreHTTPSErrors = this.configService.getOrThrow<boolean>("CHROME_IGNORE_HTTPS_ERRORS");
  }

  private async getBrowser() {
    try {
      return await connect({
        browserWSEndpoint: this.browserURL,
        acceptInsecureCerts: this.ignoreHTTPSErrors,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        ErrorMessage.InvalidBrowserConnection,
        (error as Error).message,
      );
    }
  }

  async getVersion() {
    const browser = await this.getBrowser();
    const version = await browser.version();
    await browser.disconnect();
    return version;
  }

  async printResume(resume: ResumeDto) {
    const start = performance.now();

    const url = await retry<string | undefined>(() => this.generateResume(resume), {
      retries: 3,
      randomize: true,
      onRetry: (_, attempt) => {
        this.logger.log(`Retrying to print resume #${resume.id}, attempt #${attempt}`);
      },
    });

    const duration = Number(performance.now() - start).toFixed(0);
    const numberPages = resume.data.metadata.layout.length;

    this.logger.debug(`Chrome took ${duration}ms to print ${numberPages} page(s)`);

    return url;
  }

  async printPreview(resume: ResumeDto) {
    const start = performance.now();

    const url = await retry(() => this.generatePreview(resume), {
      retries: 3,
      randomize: true,
      onRetry: (_, attempt) => {
        this.logger.log(
          `Retrying to generate preview of resume #${resume.id}, attempt #${attempt}`,
        );
      },
    });

    const duration = Number(performance.now() - start).toFixed(0);

    this.logger.debug(`Chrome took ${duration}ms to generate preview`);

    return url;
  }

  async generateResume(resume: ResumeDto) {
    try {
      this.logger.log(`Starting PDF generation for resume #${resume.id}`);
      this.logger.debug(`Resume title: ${resume.title}`);
      this.logger.debug(`Number of pages: ${resume.data.metadata.layout.length}`);

      const browser = await this.getBrowser();
      this.logger.debug('Browser connection established');

      const page = await browser.newPage();
      this.logger.debug('New page created');

      const publicUrl = this.configService.getOrThrow<string>("PUBLIC_URL");
      const storageUrl = this.configService.getOrThrow<string>("STORAGE_URL");

      let url = publicUrl;
      this.logger.debug(`Using public URL: ${url}`);

      if ([publicUrl, storageUrl].some((url) => /https?:\/\/localhost(:\d+)?/.test(url))) {
        this.logger.debug('Detected localhost URLs, switching to host.docker.internal');
        url = url.replace(
          /localhost(:\d+)?/,
          (_match, port) => `host.docker.internal${port ?? ""}`,
        );

        await page.setRequestInterception(true);
        this.logger.debug('Request interception enabled');

        page.on("request", (request) => {
          if (request.url().startsWith(storageUrl)) {
            const modifiedUrl = request
              .url()
              .replace(/localhost(:\d+)?/, (_match, port) => `host.docker.internal${port ?? ""}`);

            this.logger.debug(`Intercepted storage URL: ${request.url()} -> ${modifiedUrl}`);
            void request.continue({ url: modifiedUrl });
          } else {
            void request.continue();
          }
        });
      }

      this.logger.debug('Setting resume data in localStorage');
      await page.evaluateOnNewDocument((data) => {
        window.localStorage.setItem("resume", JSON.stringify(data));
      }, resume.data);

      this.logger.debug(`Navigating to ${url}/artboard/preview`);
      await page.goto(`${url}/artboard/preview`, { waitUntil: "networkidle0" });
      this.logger.debug('Page loaded successfully');

      const pagesBuffer: Buffer[] = [];

      const processPage = async (index: number) => {
        this.logger.debug(`Processing page ${index}`);
        const pageElement = await page.$(`[data-page="${index}"]`);
        if (!pageElement) {
          this.logger.error(`Page element not found for index ${index}`);
          throw new Error(`Page element not found for index ${index}`);
        }

        const width = (await (await pageElement?.getProperty("scrollWidth"))?.jsonValue()) ?? 0;
        const height = (await (await pageElement?.getProperty("scrollHeight"))?.jsonValue()) ?? 0;
        this.logger.debug(`Page ${index} dimensions: ${width}x${height}`);

        const temporaryHtml = await page.evaluate((element: HTMLDivElement) => {
          const clonedElement = element.cloneNode(true) as HTMLDivElement;
          const temporaryHtml_ = document.body.innerHTML;
          document.body.innerHTML = clonedElement.outerHTML;
          return temporaryHtml_;
        }, pageElement);

        if (resume.data.metadata.css.visible) {
          this.logger.debug('Applying custom CSS');
          await page.evaluate((cssValue: string) => {
            const styleTag = document.createElement("style");
            styleTag.textContent = cssValue;
            document.head.append(styleTag);
          }, resume.data.metadata.css.value);
        }

        this.logger.debug(`Generating PDF for page ${index}`);
        const uint8array = await page.pdf({ width, height, printBackground: true });
        const buffer = Buffer.from(uint8array);
        pagesBuffer.push(buffer);
        this.logger.debug(`PDF generated for page ${index}, size: ${buffer.length} bytes`);

        await page.evaluate((temporaryHtml_: string) => {
          document.body.innerHTML = temporaryHtml_;
        }, temporaryHtml);
      };

      for (let index = 1; index <= resume.data.metadata.layout.length; index++) {
        await processPage(index);
      }

      this.logger.debug('Merging PDF pages');
      const pdf = await PDFDocument.create();
      pdf.registerFontkit(fontkit);

      const fontData = resume.data.metadata.typography.font;
      const fontUrls = getFontUrls(fontData.family, fontData.variants);
      this.logger.debug(`Loading fonts: ${fontUrls.join(', ')}`);

      const responses = await Promise.all(
        fontUrls.map((url) =>
          this.httpService.axiosRef.get(url, {
            responseType: "arraybuffer",
          }),
        ),
      );
      const fontsBuffer = responses.map((response) => response.data as ArrayBuffer);
      this.logger.debug(`Loaded ${fontsBuffer.length} fonts`);

      await Promise.all(fontsBuffer.map((buffer) => pdf.embedFont(buffer)));
      this.logger.debug('Fonts embedded in PDF');

      for (const element of pagesBuffer) {
        const page = await PDFDocument.load(element);
        const [copiedPage] = await pdf.copyPages(page, [0]);
        pdf.addPage(copiedPage);
      }
      this.logger.debug(`Merged ${pagesBuffer.length} pages into final PDF`);

      const buffer = Buffer.from(await pdf.save());
      this.logger.debug(`Final PDF size: ${buffer.length} bytes`);

      this.logger.debug('Uploading PDF to storage');
      const resumeUrl = await this.storageService.uploadObject(
        resume.userId,
        "resumes",
        buffer,
        resume.title,
      );
      this.logger.debug(`PDF uploaded successfully, URL: ${resumeUrl}`);

      await page.close();
      await browser.disconnect();
      this.logger.debug('Browser connection closed');

      return resumeUrl;
    } catch (error) {
      this.logger.error(`Error generating PDF for resume #${resume.id}:`, error);
      this.logger.error('Stack trace:', (error as Error).stack);

      throw new InternalServerErrorException(
        ErrorMessage.ResumePrinterError,
        (error as Error).message,
      );
    }
  }

  async generatePreview(resume: ResumeDto) {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    const publicUrl = this.configService.getOrThrow<string>("PUBLIC_URL");
    const storageUrl = this.configService.getOrThrow<string>("STORAGE_URL");

    let url = publicUrl;

    if ([publicUrl, storageUrl].some((url) => /https?:\/\/localhost(:\d+)?/.test(url))) {
      // Switch client URL from `http[s]://localhost[:port]` to `http[s]://host.docker.internal[:port]` in development
      // This is required because the browser is running in a container and the client is running on the host machine.
      url = url.replace(/localhost(:\d+)?/, (_match, port) => `host.docker.internal${port ?? ""}`);

      await page.setRequestInterception(true);

      // Intercept requests of `localhost` to `host.docker.internal` in development
      page.on("request", (request) => {
        if (request.url().startsWith(storageUrl)) {
          const modifiedUrl = request
            .url()
            .replace(/localhost(:\d+)?/, (_match, port) => `host.docker.internal${port ?? ""}`);

          void request.continue({ url: modifiedUrl });
        } else {
          void request.continue();
        }
      });
    }

    // Set the data of the resume to be printed in the browser's session storage
    await page.evaluateOnNewDocument((data) => {
      window.localStorage.setItem("resume", JSON.stringify(data));
    }, resume.data);

    await page.setViewport({ width: 794, height: 1123 });

    await page.goto(`${url}/artboard/preview`, { waitUntil: "networkidle0" });

    // Save the JPEG to storage and return the URL
    // Store the URL in cache for future requests, under the previously generated hash digest
    const uint8array = await page.screenshot({ quality: 80, type: "jpeg" });
    const buffer = Buffer.from(uint8array);

    // Generate a hash digest of the resume data, this hash will be used to check if the resume has been updated
    const previewUrl = await this.storageService.uploadObject(
      resume.userId,
      "previews",
      buffer,
      resume.id,
    );

    // Close all the pages and disconnect from the browser
    await page.close();
    await browser.disconnect();

    return previewUrl;
  }
}
