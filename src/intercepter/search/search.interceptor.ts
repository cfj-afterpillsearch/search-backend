import {
  // BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { StatisticsService } from '../../statistics/statistics.service';

@Injectable()
export class SearchInterceptor implements NestInterceptor {
  constructor(private readonly statisticsService: StatisticsService) {}
  verifyAPIKey(_apikey: string) {
    return _apikey === 'pillnyaaan' || _apikey === 'pillnyaaan-dev';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // API_KEYのチェック
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      const apikey = request.headers['afterpillsearch-api-key'];
      if (!this.verifyAPIKey(apikey)) {
        console.log('Invalid API Key'); // TODO: まだAPIキーを設定しない
        // throw new BadRequestException('Invalid API Key');
      }
    }
    return next.handle().pipe(
      tap((data) => {
        const target = data.links.current.includes('pharmacy')
          ? 'pharmacy'
          : data.links.current.includes('medical')
          ? 'medicalinstitution'
          : null;
        const searchLog = {
          ...data.meta,
          createdAt: new Date().toISOString(),
          target,
        };

        // 非同期メソッドではあるが、同期的に実行しなくてよいのでawaitは不要
        this.statisticsService.sendSearchLog(searchLog);
      }),
    );
  }
}
