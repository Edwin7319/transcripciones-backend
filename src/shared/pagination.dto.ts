class MetaDataDto {
  total: number;
  page: number;
  limit: number;
}
export class PaginationDto<T> {
  metadata: MetaDataDto;
  data: Array<T>;
}
