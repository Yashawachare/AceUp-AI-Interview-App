/** @type { import("drizzle-kit").Config } */
export default {
  dialect: "postgresql", 
  schema: "./utils/schema.js",
  out: "./drizzle",
  dbCredentials: {
    url: 'postgresql://neondb_owner:nw1e5MVuvrJz@ep-white-tooth-a5y88sak.us-east-2.aws.neon.tech/neondb?sslmode=require',
  }
};