export class CreateTierDto {
  artistId: string;
  name: string;
  description: string;
  price: number;
  active?: boolean;
}
