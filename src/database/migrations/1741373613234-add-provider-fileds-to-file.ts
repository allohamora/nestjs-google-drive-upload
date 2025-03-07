import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProviderFiledsToFile1741373613234
  implements MigrationInterface
{
  name = 'AddProviderFiledsToFile1741373613234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file" ADD "provider" character varying(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD "provider_id" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "provider_id"`);
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "provider"`);
  }
}
