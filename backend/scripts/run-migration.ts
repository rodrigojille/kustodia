import AppDataSource from '../src/ormconfig';

async function runMigration() {
  try {
    console.log('Initializing data source...');
    await AppDataSource.initialize();
    
    console.log('Running pending migrations...');
    await AppDataSource.runMigrations();
    
    console.log('Migrations completed successfully!');
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

runMigration();
