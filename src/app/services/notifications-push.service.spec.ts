import { TestBed } from '@angular/core/testing';

import { NotificationsPushService } from './notifications-push.service';

describe('NotificationsPushService', () => {
  let service: NotificationsPushService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationsPushService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
