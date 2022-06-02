// Bearbeitet von ***
import { writeFile, rm } from 'fs/promises';
import config from '../config';
import TemplateConfig from '../models/config/TemplateConfig';
import { getTemplates } from '../utilities/getTemplates';
import IStorageAdapter from './interfaces/IStorageAdapter';
import YAML from 'yaml';
import { handle } from '../utilities';
import Logger from '../utilities/Logger';
import path from 'path';
import { LogLevel } from '../utilities/Logger/constants';
import TemplateSource from '../models/internal/TemplateSource';

export default class TemplateAdapter
  implements IStorageAdapter<TemplateConfig>
{
  protected templatesPromise: Promise<TemplateSource[]>;
  private templateDir: string = config.templateDir;

  constructor() {
    this.templatesPromise = getTemplates(this.templateDir);
  }

  private async writeTemplateToFile(
    templatePath: string,
    template: TemplateConfig
  ) {
    const [, writeErr] = await handle(
      writeFile(templatePath, YAML.stringify(template))
    );
    if (writeErr instanceof Error) {
      const message = `Error writing template to ${templatePath}: ${writeErr.message}`;
      Logger.log(message, LogLevel.ERROR);
      throw new Error(message);
    }
  }

  private async findTemplatePath(templateId: string) {
    const templates = await this.templatesPromise;
    const template = templates.find((t) => t.template.id === templateId);
    if (template === undefined) {
      const message = `Template path for template with id ${templateId} not found`;
      Logger.log(message, LogLevel.ERROR);
      throw new Error(message);
    }
    return template.path;
  }

  async create(template: TemplateConfig): Promise<string> {
    const templatePath = path.join(this.templateDir, template.id);
    await this.writeTemplateToFile(templatePath, template);
    this.templatesPromise = getTemplates(templatePath);
    return template.id;
  }

  async read(templateId: string) {
    const templates = await this.templatesPromise;
    const template = templates.find((t) => t.template.id === templateId);
    if (template === undefined) {
      const message = `Template with id ${templateId} not found`;
      Logger.log(message, LogLevel.ERROR);
      throw new Error(message);
    }
    return template.template;
  }

  async readAll() {
    const templates = await this.templatesPromise;
    return templates.map((t) => t.template);
  }

  async update(templateId: string, template: TemplateConfig) {
    const templatePath = await this.findTemplatePath(templateId);
    this.writeTemplateToFile(templatePath, template);
    this.templatesPromise = getTemplates(this.templateDir);
  }

  async delete(templateId: string) {
    const templatePath = await this.findTemplatePath(templateId);
    const [, rmErr] = await handle(rm(templatePath));
    if (rmErr instanceof Error) {
      const message = `Couldn't remove template ${this.templateDir} because an error occured: ${rmErr.message}`;
      Logger.log(message, LogLevel.ERROR);
      throw new Error(message);
    }
    this.templatesPromise = getTemplates(this.templateDir);
  }
}
