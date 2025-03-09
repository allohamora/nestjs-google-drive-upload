import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProviderViewUrlColumn1741528103805
  implements MigrationInterface
{
  name = 'AddProviderViewUrlColumn1741528103805';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "files" ADD "provider_view_url" character varying(560)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "files" DROP COLUMN "provider_view_url"`,
    );
  }
}
