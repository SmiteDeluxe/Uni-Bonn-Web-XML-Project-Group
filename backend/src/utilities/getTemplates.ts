// Bearbeitet von ***
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { handle } from '.';
import Logger from './Logger';
import parse from './parse';
import TemplateSource from '../models/internal/TemplateSource';
import { TemplateValidator } from './validation/TemplateValidator';
import { ValidationError } from './validation/Validator';

export async function getTemplates(templatePath: string) {
  const templatePaths = await getTemplatePaths(templatePath);
  const templates: TemplateSource[] = [];
  for (const path of templatePaths) {
    try {
      const unvalidatedTemplate = await parse(path);
      const template = await TemplateValidator.validate(
        unvalidatedTemplate,
        path
      );
      templates.push({ template, path });
    } catch (e) {
      if (e instanceof ValidationError) {
        Logger.warn(
          `Template "${path}" won't be loaded due to validation error.`
        );
      }
      Logger.warn(
        `Template "${path}" won't be loaded due to error: ${
          (e as Error).message ?? e
        }`
      );
      continue;
    }
  }
  return templates;
}

async function getTemplatePaths(dirPath: string, templatePaths: string[] = []) {
  const [directoryContents, readErr] = await handle(readdir(dirPath));
  if (readErr || directoryContents === undefined) {
    Logger.warn(`Could not read content of template directory: ${dirPath}`);
    return templatePaths;
  }
  for (const directoryContent of directoryContents) {
    const contentPath = path.join(dirPath, directoryContent);
    const [stats, statErr] = await handle(stat(contentPath));
    if (statErr || stats === undefined) continue;
    if (stats.isDirectory()) {
      await getTemplatePaths(contentPath, templatePaths);
    } else if (stats.isFile()) {
      const fileExtension = path.extname(directoryContent);
      if (fileExtension === '.yaml' || fileExtension === '.yml') {
        templatePaths.push(contentPath);
      }
    }
  }
  return templatePaths;
}
