import { AutoMap } from '@automapper/classes';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class CustomerRequestContextService {
  @AutoMap()
  client_id: string;
  @AutoMap()
  client_secret: string;
  constructor() {}
}
