import { registerDestination, track, page, identify } from '@/lib/analytics';

describe('Analytics System', () => {
  it('registers and forwards events', () => {
    const seen: any[] = [];
    registerDestination({ name: 'test', track: (e, p) => seen.push([e, p]) });
    track('evt', { ok: true });
    expect(seen).toEqual([['evt', { ok: true }]]);
  });

  it('page/identify do not throw', () => {
    expect(() => page('/x')).not.toThrow();
    expect(() => identify('u1', { role: 'user' })).not.toThrow();
  });

  it('handles multiple destinations', () => {
    const dest1: any[] = [];
    const dest2: any[] = [];
    
    registerDestination({ name: 'dest1', track: (e, p) => dest1.push([e, p]) });
    registerDestination({ name: 'dest2', track: (e, p) => dest2.push([e, p]) });
    
    track('test_event', { data: 'test' });
    
    expect(dest1).toContain(['test_event', { data: 'test' }]);
    expect(dest2).toContain(['test_event', { data: 'test' }]);
  });
});