// migrate-mongo configuration file
const config = {
  mongodb: {
    // MongoDB connection string
    url: process.env.MONGODB_URI || "mongodb://localhost:27017",
    
    // Database name
    databaseName: process.env.DB_NAME || "SynergySphere",
    
    // Connection options
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },

  // The migrations directory, can be an relative or absolute path
  migrationsDir: "migrations",

  // The mongodb collection where the applied changes are stored
  changelogCollectionName: "changelog",

  // The file extension to create migrations
  migrationFileExtension: ".js",

  // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determine
  // if the file should be run.  Requires that scripts are coded to be run multiple times.
  useFileHash: false,

  // Don't change this, unless you know what you're doing
  moduleSystem: 'commonjs',
};

module.exports = config;
