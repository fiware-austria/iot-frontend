import {Category, CategoryConfiguration, CategoryServiceFactory, LogLevel} from 'typescript-logging';

CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.fromString(process.env.LOG_LEVEL || 'warn')));

// Create categories, they will autoregister themselves, one category without parent (root) and a child category.
export const catSystem = new Category('system');
export const catTrans = new Category('transmission', catSystem);

// Optionally get a logger for a category, since 0.5.0 this is not necessary anymore, you can use the category itself to log.
// export const log: CategoryLogger = CategoryServiceFactory.getLogger(cat);
