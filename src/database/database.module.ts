import { TypeOrmModule } from "@nestjs/typeorm";
import { Logger } from "@nestjs/common";
import { DataSource, DataSourceOptions } from "typeorm";
import { User } from "src/auth/entities/auth.entity";

const logger = new Logger("DatabaseConnection");

export const DatabaseConfig = TypeOrmModule.forRootAsync({
  useFactory: async () => {
    const config: DataSourceOptions = {
      type: "mysql",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || "mySql",
      password: process.env.DB_PASS || "test123",
      database: process.env.DB_NAME || "auth",
      synchronize: true,
      // logging: true,
      logger: "advanced-console" as const,
      entities: [User],
      subscribers: [],
      migrations: [],
      migrationsTableName: "migrations",
      migrationsRun: true,
      connectTimeout: 10000,
      dropSchema: false,
      ssl: false,
    };

    const dataSource = new DataSource(config);

    try {
      await dataSource.initialize();
      logger.log("✅ Database connection established successfully");
      logger.log(
        `Connected to ${config.database} on ${config.host}:${config.port}`,
      );
      await dataSource.destroy();
    } catch (error) {
      logger.error("❌ Database connection failed", error);
      throw error;
    }

    return config;
  },
});
