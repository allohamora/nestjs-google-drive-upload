import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFilesTable1741430896620 implements MigrationInterface {
  name = 'CreateFilesTable1741430896620';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" text NOT NULL, "provider" character varying(50) NOT NULL, "provider_id" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "files"`);
  }
}
